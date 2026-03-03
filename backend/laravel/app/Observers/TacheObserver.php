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
     * syncTaskToGoogle() gère déjà setAccessTokenForUser() en interne.
     */
    public function created(Tache $tache): void
    {
        if ($tache->user->google_access_token) {
            try {
                $this->googleService->syncTaskToGoogle($tache);
            } catch (\Exception $e) {
                Log::error("Erreur synchro Google Task (created): " . $e->getMessage());
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
        }
    }

    /**
     * Handle the Tache "deleted" event.
     */
    public function deleted(Tache $tache): void
    {
        if ($tache->user->google_access_token && $tache->google_task_id) {
            try {
                $this->googleService->deleteTaskFromGoogle($tache);
            } catch (\Exception $e) {
                Log::error("Erreur suppression Google Task (deleted): " . $e->getMessage());
            }
        }
    }
}
