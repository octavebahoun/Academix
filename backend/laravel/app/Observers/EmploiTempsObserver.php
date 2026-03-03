<?php

namespace App\Observers;

use App\Models\EmploiTempsFiliere;
use App\Jobs\SyncGoogleCalendarForFiliereJob;

class EmploiTempsObserver
{
    /**
     * Handle the EmploiTempsFiliere "created" event.
     */
    public function created(EmploiTempsFiliere $emploiTempsFiliere): void
    {
        SyncGoogleCalendarForFiliereJob::dispatch($emploiTempsFiliere->filiere_id)
            ->delay(now()->addSeconds(5)); // Petit délai pour regrouper les modifications
    }

    /**
     * Handle the EmploiTempsFiliere "updated" event.
     */
    public function updated(EmploiTempsFiliere $emploiTempsFiliere): void
    {
        SyncGoogleCalendarForFiliereJob::dispatch($emploiTempsFiliere->filiere_id)
            ->delay(now()->addSeconds(5));
    }

    /**
     * Handle the EmploiTempsFiliere "deleted" event.
     */
    public function deleted(EmploiTempsFiliere $emploiTempsFiliere): void
    {
        SyncGoogleCalendarForFiliereJob::dispatch($emploiTempsFiliere->filiere_id)
            ->delay(now()->addSeconds(5));
    }
}
