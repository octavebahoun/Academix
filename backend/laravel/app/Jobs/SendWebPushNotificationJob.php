<?php

namespace App\Jobs;

use App\Services\WebPushService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Job asynchrone pour envoyer des notifications push VAPID.
 *
 * Permet de ne jamais bloquer la requête HTTP lors de l'envoi de push.
 * 3 tentatives avec back-off exponentiel (10s, 30s, 90s).
 */
class SendWebPushNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Nombre max de tentatives.
     */
    public int $tries = 3;

    /**
     * Back-off exponentiel (secondes).
     */
    public array $backoff = [10, 30, 90];


    public function __construct(
        public readonly int $userId,
        public readonly array $payload,
    ) {
    }


    public function handle(WebPushService $service): void
    {
        if (!$service->isEnabled()) {
            Log::info("[Push Job] Service désactivé, notification ignorée pour user #{$this->userId}.");
            return;
        }

        $service->sendToUser($this->userId, $this->payload);
    }


    /**
     * Gestion des échecs définitifs.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("[Push Job] Échec définitif pour user #{$this->userId}: {$exception->getMessage()}");
    }
}
