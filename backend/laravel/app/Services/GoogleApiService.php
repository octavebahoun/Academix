<?php

namespace App\Services;

use Google\Client;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use Google\Service\Tasks;
use Google\Service\Tasks\Task;
use App\Models\User;
use App\Models\Tache;
use App\Models\EmploiTempsFiliere;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GoogleApiService
{
    protected Client $client;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setClientId(config('services.google.client_id'));
        $this->client->setClientSecret(config('services.google.client_secret'));
        $this->client->setRedirectUri(config('services.google.redirect_uri'));

        $this->client->addScope(Calendar::CALENDAR);
        $this->client->addScope(Tasks::TASKS);
        $this->client->addScope('openid');

        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
    }

    public function getAuthUrl(?string $state = null): string
    {
        if ($state) {
            $this->client->setState($state);
        }
        return $this->client->createAuthUrl();
    }

    public function fetchAccessTokenWithAuthCode(string $code): array
    {
        $token = $this->client->fetchAccessTokenWithAuthCode($code);

        if (isset($token['error'])) {
            throw new \Exception('Google OAuth error: ' . ($token['error_description'] ?? $token['error']));
        }

        return $token;
    }

    public function setAccessTokenForUser(User $user): bool
    {
        if (!$user->google_access_token)
            return false;

        $token = json_decode($user->google_access_token, true);

        // Token corrompu (erreur Google stockée par erreur)
        if (!is_array($token) || isset($token['error']))
            return false;

        $this->client->setAccessToken($token);

        if ($this->client->isAccessTokenExpired()) {
            if ($user->google_refresh_token) {
                $newToken = $this->client->fetchAccessTokenWithRefreshToken($user->google_refresh_token);
                if (isset($newToken['error']))
                    return false;
                $user->update(['google_access_token' => json_encode($newToken)]);
            } else {
                return false;
            }
        }
        return true;
    }

    // --- GOOGLE CALENDAR (Emploi du temps) ---

    /**
     * Crée ou récupère le calendrier dédié "AcademiX".
     * Vérifie que le calendrier existe toujours côté Google, le recrée si supprimé.
     */
    public function ensureAcademiXCalendarExists(User $user): string
    {
        if (!$this->setAccessTokenForUser($user)) {
            throw new \RuntimeException("Token Google invalide pour l'utilisateur #{$user->id}.");
        }

        $service = new Calendar($this->client);
        $timezone = config('services.google.timezone', 'Africa/Porto-Novo');

        // Vérifier que le calendrier existant est toujours accessible
        if ($user->google_calendar_id) {
            try {
                $service->calendars->get($user->google_calendar_id);
                return $user->google_calendar_id;
            } catch (\Google\Service\Exception $e) {
                if ($e->getCode() === 404 || $e->getCode() === 410) {
                    Log::warning("[GoogleCalendar] Calendrier {$user->google_calendar_id} introuvable pour user #{$user->id}, recréation...");
                    $user->update(['google_calendar_id' => null]);
                } else {
                    throw $e;
                }
            }
        }

        // Créer un nouveau calendrier dédié
        $calendar = new Calendar\Calendar();
        $calendar->setSummary('AcademiX - Emploi du Temps');
        $calendar->setTimeZone($timezone);

        $createdCalendar = $service->calendars->insert($calendar);
        $user->update(['google_calendar_id' => $createdCalendar->getId()]);
        return $createdCalendar->getId();
    }

    /**
     * Synchronise l'emploi du temps de l'étudiant vers Google Calendar.
     * Utilise des IDs d'événements déterministes pour l'idempotence (upsert, pas de doublons).
     */
    public function syncEmploiTemps(User $user)
    {
        if (!$this->setAccessTokenForUser($user)) {
            Log::warning("Impossible de synchroniser l'emploi du temps pour l'utilisateur {$user->id} : Token invalide.");
            return;
        }

        $calendarId = $this->ensureAcademiXCalendarExists($user);
        $service = new Calendar($this->client);
        $timezone = config('services.google.timezone', 'Africa/Porto-Novo');

        $edt = EmploiTempsFiliere::with('matiere')
            ->where('filiere_id', $user->filiere_id)
            ->get();

        $dayMap = [
            'Lundi' => 'MO',
            'Mardi' => 'TU',
            'Mercredi' => 'WE',
            'Jeudi' => 'TH',
            'Vendredi' => 'FR',
            'Samedi' => 'SA',
            'Dimanche' => 'SU',
        ];

        // Calcul dynamique de la fin d'année universitaire
        $now = Carbon::now();
        $endYear = $now->month >= 9 ? $now->year + 1 : $now->year;
        $untilDate = Carbon::create($endYear, 6, 30, 23, 59, 59, 'UTC')->format('Ymd\THis\Z');
        $startDate = Carbon::now()->startOfWeek();

        // Upsert de chaque cours avec un ID déterministe
        $expectedEventIds = [];
        foreach ($edt as $cours) {
            $eventId = $this->generateEdtEventId($cours->id);
            $expectedEventIds[] = $eventId;

            if (!isset($dayMap[$cours->jour])) {
                Log::warning("[GoogleSync] Jour inconnu '{$cours->jour}' pour le cours #{$cours->id}, ignoré.");
                continue;
            }

            $eventData = [
                'id' => $eventId,
                'summary' => "{$cours->matiere->nom} ({$cours->type_cours})",
                'location' => $cours->salle ?? 'A définir',
                'description' => "Enseignant: {$cours->enseignant}\n-- Synchronisé par AcademiX",
                'start' => [
                    'dateTime' => $this->getDateTimeForDay($startDate, $cours->jour, $cours->heure_debut),
                    'timeZone' => $timezone,
                ],
                'end' => [
                    'dateTime' => $this->getDateTimeForDay($startDate, $cours->jour, $cours->heure_fin),
                    'timeZone' => $timezone,
                ],
                'recurrence' => ["RRULE:FREQ=WEEKLY;BYDAY={$dayMap[$cours->jour]};UNTIL={$untilDate}"],
                'reminders' => [
                    'useDefault' => false,
                    'overrides' => [['method' => 'popup', 'minutes' => 30]],
                ],
            ];

            try {
                // Upsert : essayer update d'abord, créer si 404
                $service->events->update($calendarId, $eventId, new Event($eventData));
            } catch (\Google\Service\Exception $e) {
                if ($e->getCode() === 404) {
                    try {
                        $service->events->insert($calendarId, new Event($eventData));
                    } catch (\Exception $insertEx) {
                        Log::error("[GoogleSync] Erreur insertion cours #{$cours->id} pour user #{$user->id}: " . $insertEx->getMessage());
                    }
                } else {
                    Log::error("[GoogleSync] Erreur upsert cours #{$cours->id} pour user #{$user->id}: " . $e->getMessage());
                }
            }
        }

        // Nettoyage : supprimer les événements AcademiX EDT orphelins
        $this->cleanupOrphanEdtEvents($service, $calendarId, $expectedEventIds);
    }

    private function getDateTimeForDay(Carbon $currentWeekStart, string $jour, $heure)
    {
        $dayMap = ['Lundi' => 0, 'Mardi' => 1, 'Mercredi' => 2, 'Jeudi' => 3, 'Vendredi' => 4, 'Samedi' => 5, 'Dimanche' => 6];
        $time = Carbon::parse($heure);
        return $currentWeekStart->copy()->addDays($dayMap[$jour] ?? 0)->setTime($time->hour, $time->minute)->toRfc3339String();
    }

    /**
     * Génère un ID d'événement Google Calendar déterministe pour un cours EDT.
     * Caractères autorisés : a-v, 0-9 (base32hex).
     */
    private function generateEdtEventId(int $coursId): string
    {
        return 'academikcours' . str_pad($coursId, 8, '0', STR_PAD_LEFT);
    }

    /**
     * Supprime les événements AcademiX EDT qui ne correspondent plus à un cours actuel.
     */
    private function cleanupOrphanEdtEvents(Calendar $service, string $calendarId, array $expectedEventIds): void
    {
        try {
            $pageToken = null;
            do {
                $params = ['maxResults' => 250];
                if ($pageToken) {
                    $params['pageToken'] = $pageToken;
                }
                $events = $service->events->listEvents($calendarId, $params);

                foreach ($events->getItems() as $event) {
                    $eventId = $event->getId();
                    if (str_starts_with($eventId, 'academikcours') && !in_array($eventId, $expectedEventIds)) {
                        try {
                            $service->events->delete($calendarId, $eventId);
                            Log::debug("[GoogleSync] Événement orphelin {$eventId} supprimé.");
                        } catch (\Exception $e) {
                            Log::debug("[GoogleSync] Impossible de supprimer l'événement orphelin {$eventId}: " . $e->getMessage());
                        }
                    }
                }

                $pageToken = $events->getNextPageToken();
            } while ($pageToken);
        } catch (\Exception $e) {
            Log::warning("[GoogleSync] Erreur lors du nettoyage des événements orphelins: " . $e->getMessage());
        }
    }

    // --- GOOGLE TASKS (Gestion des tâches) ---

    public function ensureAcademiXTaskListExists(User $user): string
    {
        if (!$this->setAccessTokenForUser($user)) {
            throw new \RuntimeException("Token Google invalide pour l'utilisateur #{$user->id}.");
        }

        $service = new Tasks($this->client);

        // Vérifier que la task list existante est toujours accessible
        if ($user->google_task_list_id) {
            try {
                $service->tasklists->get($user->google_task_list_id);
                return $user->google_task_list_id;
            } catch (\Google\Service\Exception $e) {
                if ($e->getCode() === 404 || $e->getCode() === 410) {
                    Log::warning("[GoogleTasks] Task list {$user->google_task_list_id} introuvable pour user #{$user->id}, recréation...");
                    $user->update(['google_task_list_id' => null]);
                } else {
                    throw $e;
                }
            }
        }

        $taskList = new Tasks\TaskList();
        $taskList->setTitle('AcademiX Tasks');

        $createdList = $service->tasklists->insert($taskList);
        $user->update(['google_task_list_id' => $createdList->getId()]);
        return $createdList->getId();
    }

    public function syncTaskToGoogle(Tache $tache)
    {
        $user = $tache->user;
        if (!$this->setAccessTokenForUser($user))
            return;

        $taskListId = $this->ensureAcademiXTaskListExists($user);
        $service = new Tasks($this->client);

        $googleTask = new Task();
        $googleTask->setTitle($tache->titre);
        $googleTask->setNotes($tache->description);
        $googleTask->setDue($tache->date_limite->toRfc3339String());

        if ($tache->google_task_id) {
            $service->tasks->update($taskListId, $tache->google_task_id, $googleTask);
        } else {
            $created = $service->tasks->insert($taskListId, $googleTask);
            $tache->update(['google_task_id' => $created->getId()]);
        }
    }

    /**
     * Synchronise une tâche comme événement visible dans Google Calendar.
     * Utilise un ID d'événement déterministe pour l'idempotence (pas de doublons).
     */
    public function syncTaskToCalendar(Tache $tache): void
    {
        $user = $tache->user;
        if (!$this->setAccessTokenForUser($user))
            return;

        $calendarId = $this->ensureAcademiXCalendarExists($user);
        $service = new Calendar($this->client);

        // ID d'événement idempotent (caractères autorisés : a-v, 0-9)
        $eventId = 'academitache' . str_pad($tache->id, 8, '0', STR_PAD_LEFT);

        $statusLabel = match ($tache->statut ?? 'a_faire') {
            'terminee' => '[Terminée]',
            'en_cours' => '[En cours]',
            default => '[A faire]',
        };

        $prioriteLabel = match ($tache->priorite ?? 'moyenne') {
            'haute' => 'Haute',
            'basse' => 'Basse',
            default => 'Moyenne',
        };

        $description = trim(
            ($tache->description ? $tache->description . "\n\n" : '')
            . "Priorité : {$prioriteLabel}\n"
            . "Statut : {$tache->statut}\n"
            . "-- Synchronisé par AcademiX"
        );

        // Événement journée entière à la date limite
        // Note : pour les all-day events, end.date est EXCLUSIF (+1 jour)
        $dueDate = $tache->date_limite->format('Y-m-d');
        $endDate = $tache->date_limite->copy()->addDay()->format('Y-m-d');

        $eventData = [
            'id' => $eventId,
            'summary' => "{$statusLabel} {$tache->titre}",
            'description' => $description,
            'start' => ['date' => $dueDate],
            'end' => ['date' => $endDate],
            'reminders' => [
                'useDefault' => false,
                'overrides' => [
                    ['method' => 'popup', 'minutes' => 60],
                ],
            ],
            'transparency' => 'transparent',
        ];

        try {
            // Essayer update d'abord (idempotent)
            $service->events->update($calendarId, $eventId, new Event($eventData));
            Log::info("[GoogleCalendar] Tâche #{$tache->id} mise à jour sur le calendrier.");
        } catch (\Google\Service\Exception $e) {
            if ($e->getCode() === 404) {
                // N'existe pas encore → création
                $service->events->insert($calendarId, new Event($eventData));
                Log::info("[GoogleCalendar] Tâche #{$tache->id} créée sur le calendrier.");
            } else {
                throw $e;
            }
        }
    }

    /**
     * Supprime l'événement calendrier associé à une tâche.
     */
    public function deleteTaskFromCalendar(Tache $tache): void
    {
        $user = $tache->user;
        if (!$this->setAccessTokenForUser($user))
            return;

        $calendarId = $this->ensureAcademiXCalendarExists($user);
        $service = new Calendar($this->client);

        $eventId = 'academitache' . str_pad($tache->id, 8, '0', STR_PAD_LEFT);

        try {
            $service->events->delete($calendarId, $eventId);
            Log::info("[GoogleCalendar] Événement tâche #{$tache->id} supprimé du calendrier.");
        } catch (\Google\Service\Exception $e) {
            if ($e->getCode() !== 404 && $e->getCode() !== 410) {
                Log::warning("Impossible de supprimer l'événement calendrier de la tâche #{$tache->id}: " . $e->getMessage());
            }
        }
    }

    public function deleteTaskFromGoogle(Tache $tache)
    {
        if (!$tache->google_task_id)
            return;

        $user = $tache->user;
        if (!$this->setAccessTokenForUser($user))
            return;

        $taskListId = $this->ensureAcademiXTaskListExists($user);
        $service = new Tasks($this->client);

        try {
            $service->tasks->delete($taskListId, $tache->google_task_id);
        } catch (\Exception $e) {
            Log::warning("Impossible de supprimer la tâche Google: " . $e->getMessage());
        }
    }

    /**
     * Supprime une tâche Google Tasks par son ID (utilisé par le job async).
     */
    public function deleteGoogleTaskById(User $user, string $googleTaskId): void
    {
        if (!$this->setAccessTokenForUser($user))
            return;

        $taskListId = $this->ensureAcademiXTaskListExists($user);
        $service = new Tasks($this->client);

        try {
            $service->tasks->delete($taskListId, $googleTaskId);
        } catch (\Exception $e) {
            Log::warning("[GoogleTasks] Impossible de supprimer la tâche {$googleTaskId}: " . $e->getMessage());
        }
    }

    /**
     * Supprime un événement Calendar par son ID (utilisé par le job async).
     */
    public function deleteCalendarEventById(User $user, string $eventId): void
    {
        if (!$this->setAccessTokenForUser($user))
            return;

        $calendarId = $this->ensureAcademiXCalendarExists($user);
        $service = new Calendar($this->client);

        try {
            $service->events->delete($calendarId, $eventId);
        } catch (\Google\Service\Exception $e) {
            if ($e->getCode() !== 404 && $e->getCode() !== 410) {
                Log::warning("[GoogleCalendar] Impossible de supprimer l'événement {$eventId}: " . $e->getMessage());
            }
        }
    }

    /**
     * Révoque le token Google OAuth de l'utilisateur.
     */
    public function revokeToken(User $user): void
    {
        if (!$user->google_access_token)
            return;

        $token = json_decode($user->google_access_token, true);
        if (is_array($token) && !isset($token['error'])) {
            $this->client->setAccessToken($token);
            $this->client->revokeToken();
        }
    }

    /**
     * Récupère l'ID Google de l'utilisateur depuis le id_token OAuth.
     */
    public function fetchGoogleUserId(array $token): ?string
    {
        if (!isset($token['id_token']))
            return null;

        try {
            $payload = $this->client->verifyIdToken($token['id_token']);
            return $payload['sub'] ?? null;
        } catch (\Exception $e) {
            Log::warning("[GoogleAuth] Impossible de décoder l'id_token: " . $e->getMessage());
            return null;
        }
    }
}
