<?php

namespace App\Jobs;

use App\Models\Tache;
use App\Models\User;
use App\Services\GoogleApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncTacheToGoogleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Nombre max de tentatives.
     */
    public int $tries = 3;

    /**
     * Délai entre les tentatives (secondes).
     */
    public int $backoff = 30;

    public function __construct(
        protected int $tacheId,
        protected string $action, // 'sync' ou 'delete'
        protected ?string $googleTaskId = null,
        protected ?int $userId = null,
    ) {
    }

    public function handle(GoogleApiService $googleService): void
    {
        if ($this->action === 'delete') {
            $this->handleDelete($googleService);
            return;
        }

        // Action 'sync' : charger la tâche depuis la base
        $tache = Tache::find($this->tacheId);
        if (!$tache) {
            Log::debug("[GoogleSync] Tâche #{$this->tacheId} introuvable, job ignoré.");
            return;
        }

        if (!$tache->user || !$tache->user->google_access_token) {
            return;
        }

        // Sync vers Google Tasks (panneau latéral)
        try {
            $googleService->syncTaskToGoogle($tache);
        } catch (\Exception $e) {
            Log::error("[GoogleSync] Erreur synchro Google Task #{$this->tacheId}: " . $e->getMessage());
        }

        // Sync vers Google Calendar (événement visible dans l'agenda)
        try {
            $googleService->syncTaskToCalendar($tache);
        } catch (\Exception $e) {
            Log::error("[GoogleSync] Erreur synchro Calendar Event #{$this->tacheId}: " . $e->getMessage());
        }
    }

    /**
     * Gère la suppression côté Google (le modèle Tache est déjà supprimé en base).
     */
    protected function handleDelete(GoogleApiService $googleService): void
    {
        $user = User::find($this->userId);
        if (!$user || !$user->google_access_token) {
            return;
        }

        // Supprimer la tâche Google Tasks
        if ($this->googleTaskId) {
            try {
                $googleService->deleteGoogleTaskById($user, $this->googleTaskId);
            } catch (\Exception $e) {
                Log::error("[GoogleSync] Erreur suppression Google Task #{$this->tacheId}: " . $e->getMessage());
            }
        }

        // Supprimer l'événement Calendar (ID déterministe basé sur tache ID)
        $eventId = 'academitache' . str_pad($this->tacheId, 8, '0', STR_PAD_LEFT);
        try {
            $googleService->deleteCalendarEventById($user, $eventId);
        } catch (\Exception $e) {
            Log::error("[GoogleSync] Erreur suppression Calendar Event #{$this->tacheId}: " . $e->getMessage());
        }
    }

    /**
     * Gère l'échec définitif du job.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("[GoogleSync] Job tâche échoué définitivement (tache #{$this->tacheId}, action: {$this->action}): " . $exception->getMessage());
    }
}
