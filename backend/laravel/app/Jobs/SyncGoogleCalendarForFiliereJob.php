<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\GoogleApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;


class SyncGoogleCalendarForFiliereJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Nombre max de tentatives.
     */
    public int $tries = 3;

    /**
     * Délai entre les tentatives (secondes).
     */
    public int $backoff = 60;

    public function __construct(
        protected int $filiereId
    ) {
    }

    public function handle(GoogleApiService $googleService): void
    {
        $users = User::where('filiere_id', $this->filiereId)
            ->whereNotNull('google_access_token')
            ->get();

        if ($users->isEmpty()) {
            Log::info("[GoogleSync] Aucun utilisateur Google connecté pour la filière {$this->filiereId}.");
            return;
        }

        Log::info("[GoogleSync] Début de la sync pour {$users->count()} utilisateur(s) (filière {$this->filiereId}).");

        foreach ($users as $user) {
            try {
                $googleService->syncEmploiTemps($user);
            } catch (\Exception $e) {
                Log::error("[GoogleSync] Échec pour user #{$user->id} (filière {$this->filiereId}): " . $e->getMessage());
            }
        }

        Log::info("[GoogleSync] Sync terminée pour la filière {$this->filiereId}.");
    }

    /**
     * Gère l'échec définitif du job (après toutes les tentatives).
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("[GoogleSync] Job échoué définitivement pour la filière {$this->filiereId}: " . $exception->getMessage());
    }
}
