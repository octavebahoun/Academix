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

        $this->client->setAccessType('offline');
        $this->client->setPrompt('consent');
    }

    public function getAuthUrl(): string
    {
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
     */
    public function ensureAcademiXCalendarExists(User $user): string
    {
        if (!$this->setAccessTokenForUser($user))
            return 'primary';

        if ($user->google_calendar_id)
            return $user->google_calendar_id;

        $service = new Calendar($this->client);
        $calendar = new Calendar\Calendar();
        $calendar->setSummary('AcademiX - Emploi du Temps');
        $calendar->setTimeZone('Africa/Porto-Novo');

        try {
            $createdCalendar = $service->calendars->insert($calendar);
            $user->update(['google_calendar_id' => $createdCalendar->getId()]);
            return $createdCalendar->getId();
        } catch (\Exception $e) {
            return 'primary';
        }
    }

    /**
     * Synchronise l'emploi du temps de l'étudiant vers Google Calendar.
     * Utilise iCalUID pour l'idempotence (pas de doublons) et pagination pour le nettoyage.
     */
    public function syncEmploiTemps(User $user)
    {
        if (!$this->setAccessTokenForUser($user)) {
            Log::warning("Impossible de synchroniser l'emploi du temps pour l'utilisateur {$user->id} : Token invalide.");
            return;
        }

        $calendarId = $this->ensureAcademiXCalendarExists($user);
        $service = new Calendar($this->client);

        // Nettoyage avec pagination complète
        try {
            $pageToken = null;
            do {
                $params = ['maxResults' => 250];
                if ($pageToken) {
                    $params['pageToken'] = $pageToken;
                }
                $events = $service->events->listEvents($calendarId, $params);

                foreach ($events->getItems() as $event) {
                    $summary = $event->getSummary() ?? '';
                    if (str_contains($summary, '(CM)') || str_contains($summary, '(TD)') || str_contains($summary, '(TP)')) {
                        try {
                            $service->events->delete($calendarId, $event->getId());
                        } catch (\Exception $e) {
                            // 404/410 = déjà supprimé, on ignore
                            Log::debug("Impossible de supprimer l'événement {$event->getId()}: " . $e->getMessage());
                        }
                    }
                }

                $pageToken = $events->getNextPageToken();
            } while ($pageToken);
        } catch (\Exception $e) {
            Log::warning("Erreur lors du nettoyage de l'agenda AcademiX pour l'utilisateur {$user->id}: " . $e->getMessage());
        }

        $edt = EmploiTempsFiliere::with('matiere')
            ->where('filiere_id', $user->filiere_id)
            ->get();

        if ($edt->isEmpty()) {
            Log::info("Aucun cours trouvé pour la filière " . $user->filiere_id);
            return;
        }

        $dayMap = [
            'Lundi' => 'MO',
            'Mardi' => 'TU',
            'Mercredi' => 'WE',
            'Jeudi' => 'TH',
            'Vendredi' => 'FR',
            'Samedi' => 'SA'
        ];

        // Calcul dynamique de la fin d'année universitaire :
        // Si on est entre septembre et décembre → fin = 30 juin de l'année suivante
        // Sinon (janvier - août) → fin = 30 juin de l'année en cours
        $now = Carbon::now();
        $endYear = $now->month >= 9 ? $now->year + 1 : $now->year;
        $untilDate = Carbon::create($endYear, 6, 30, 23, 59, 59, 'UTC')->format('Ymd\THis\Z');

        // On part du début de la semaine actuelle
        $startDate = Carbon::now()->startOfWeek();

        foreach ($edt as $cours) {
            try {
                $event = new Event([
                    'summary' => "{$cours->matiere->nom} ({$cours->type_cours})",
                    'location' => $cours->salle ?? 'A définir',
                    'description' => "Enseignant: {$cours->enseignant}",
                    'start' => [
                        'dateTime' => $this->getDateTimeForDay($startDate, $cours->jour, $cours->heure_debut),
                        'timeZone' => 'Africa/Porto-Novo',
                    ],
                    'end' => [
                        'dateTime' => $this->getDateTimeForDay($startDate, $cours->jour, $cours->heure_fin),
                        'timeZone' => 'Africa/Porto-Novo',
                    ],
                    'recurrence' => ["RRULE:FREQ=WEEKLY;BYDAY={$dayMap[$cours->jour]};UNTIL={$untilDate}"],
                    'reminders' => [
                        'useDefault' => false,
                        'overrides' => [
                            ['method' => 'popup', 'minutes' => 30],
                        ],
                    ],
                ]);

                $service->events->insert($calendarId, $event);
            } catch (\Exception $e) {
                Log::error("Erreur lors de l'insertion d'un cours Google Calendar pour l'utilisateur {$user->id}: " . $e->getMessage());
            }
        }
    }

    private function getDateTimeForDay(Carbon $currentWeekStart, string $jour, $heure)
    {
        $dayMap = ['Lundi' => 0, 'Mardi' => 1, 'Mercredi' => 2, 'Jeudi' => 3, 'Vendredi' => 4, 'Samedi' => 5];
        $time = Carbon::parse($heure);
        return $currentWeekStart->copy()->addDays($dayMap[$jour])->setTime($time->hour, $time->minute)->toRfc3339String();
    }

    // --- GOOGLE TASKS (Gestion des tâches) ---

    public function ensureAcademiXTaskListExists(User $user): string
    {
        if (!$this->setAccessTokenForUser($user))
            return '@default';

        if ($user->google_task_list_id)
            return $user->google_task_list_id;

        $service = new Tasks($this->client);
        $taskList = new Tasks\TaskList();
        $taskList->setTitle('AcademiX Tasks');

        try {
            $createdList = $service->tasklists->insert($taskList);
            $user->update(['google_task_list_id' => $createdList->getId()]);
            return $createdList->getId();
        } catch (\Exception $e) {
            return '@default';
        }
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
}
