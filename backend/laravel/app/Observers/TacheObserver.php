<?php

namespace App\Observers;

use App\Models\Tache;
use App\Jobs\SyncTacheToGoogleJob;
use Illuminate\Support\Facades\Log;

class TacheObserver
{
    /**
     * Handle the Tache "created" event.
     * Dispatche un job async pour synchroniser vers Google Tasks + Calendar.
     */
    public function created(Tache $tache): void
    {
        if ($tache->user->google_access_token) {
            SyncTacheToGoogleJob::dispatch($tache->id, 'sync');
        }
    }

    /**
     * Handle the Tache "updated" event.
     */
    public function updated(Tache $tache): void
    {
        if ($tache->user->google_access_token) {
            SyncTacheToGoogleJob::dispatch($tache->id, 'sync');
        }
    }

    /**
     * Handle the Tache "deleted" event.
     * Passe les données nécessaires car le modèle sera supprimé en base.
     */
    public function deleted(Tache $tache): void
    {
        if ($tache->user->google_access_token) {
            SyncTacheToGoogleJob::dispatch(
                $tache->id,
                'delete',
                $tache->google_task_id,
                $tache->user_id,
            );
        }
    }
}
