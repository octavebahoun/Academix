<?php

namespace App\Observers;

use App\Models\Tache;
use App\Services\GoogleApiService;
use Illuminate\Support\Facades\Log;

class TacheObserver
{
    public function __construct(protected GoogleApiService $googleService)
    {
    }

    /**
     * Handle the Tache "created" event.
     * syncTaskToGoogle() → Google Tasks (panneau latéral)
     * syncTaskToCalendar() → Événement Calendar (visible dans l'agenda)
     */
    public function created(Tache $tache): void
    {
        if ($tache->user->google_access_token) {
            try {
                $this->googleService->syncTaskToGoogle($tache);
            } catch (\Exception $e) {
                Log::error("Erreur synchro Google Task (created): " . $e->getMessage());
            }
            try {
                $this->googleService->syncTaskToCalendar($tache);
            } catch (\Exception $e) {
                Log::error("Erreur synchro Calendar Event pour tâche (created): " . $e->getMessage());
            }
        }
    }

    /**
     * Handle the Tache "updated" event.
     */
    public function updated(Tache $tache): void
    {
        if ($tache->user->google_access_token) {
            try {
                $this->googleService->syncTaskToGoogle($tache);
            } catch (\Exception $e) {
                Log::error("Erreur synchro Google Task (updated): " . $e->getMessage());
            }
            try {
                $this->googleService->syncTaskToCalendar($tache);
            } catch (\Exception $e) {
                Log::error("Erreur synchro Calendar Event pour tâche (updated): " . $e->getMessage());
            }
        }
    }

    /**
     * Handle the Tache "deleted" event.
     */
    public function deleted(Tache $tache): void
    {
        if ($tache->user->google_access_token) {
            if ($tache->google_task_id) {
                try {
                    $this->googleService->deleteTaskFromGoogle($tache);
                } catch (\Exception $e) {
                    Log::error("Erreur suppression Google Task (deleted): " . $e->getMessage());
                }
            }
            try {
                $this->googleService->deleteTaskFromCalendar($tache);
            } catch (\Exception $e) {
                Log::error("Erreur suppression Calendar Event pour tâche (deleted): " . $e->getMessage());
            }
        }
    }
}
