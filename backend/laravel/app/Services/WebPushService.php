<?php

namespace App\Services;

use App\Models\PushSubscription;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use Illuminate\Support\Facades\Log;

class WebPushService
{
    private ?WebPush $webPush = null;

    /**
     * Indique si le service est opérationnel (clés VAPID présentes).
     */
    private bool $enabled = false;

    public function __construct()
    {
        $publicKey = config('services.vapid.public_key');
        $privateKey = config('services.vapid.private_key');
        $subject = config('services.vapid.subject', 'mailto:contact@academix.app');

        // ── Guard : si les clés VAPID ne sont pas configurées, on désactive le service
        if (empty($publicKey) || empty($privateKey)) {
            Log::warning('[Push] Clés VAPID non configurées — service désactivé. Ajoutez VAPID_PUBLIC_KEY et VAPID_PRIVATE_KEY dans .env');
            return;
        }

        try {
            $auth = [
                'VAPID' => [
                    'subject' => $subject,
                    'publicKey' => $publicKey,
                    'privateKey' => $privateKey,
                ],
            ];

            $this->webPush = new WebPush($auth);

            // TTL (durée de vie du message sur le push service)
            $ttl = app()->environment('local') ? 86400 : 14400; // 24h en dev, 4h en prod
            $curlOpts = app()->environment('local')
                ? [CURLOPT_SSL_VERIFYPEER => false]
                : [];

            $this->webPush->setDefaultOptions([
                'TTL' => $ttl,
                'curl' => $curlOpts,
            ]);

            $this->enabled = true;
        } catch (\Throwable $e) {
            Log::error('[Push] Impossible d\'initialiser WebPush : ' . $e->getMessage());
        }
    }


    /**
     * Vérifie si le service est opérationnel.
     */
    public function isEnabled(): bool
    {
        return $this->enabled;
    }


    /**
     * Envoie un push à toutes les subscriptions d'un utilisateur.
     * Utilise le batching (queueNotification + flush) pour envoyer en parallèle.
     */
    public function sendToUser(int $userId, array $payload): void
    {
        if (!$this->enabled) {
            return;
        }

        $subscriptions = PushSubscription::where('user_id', $userId)->get();

        if ($subscriptions->isEmpty()) {
            return;
        }

        $jsonPayload = json_encode(array_merge([
            'title' => 'AcademiX',
            'icon' => '/icons/icon-192x192.png',
            'badge' => '/icons/icon-72x72.png',
            'url' => '/dashboard',
        ], $payload));

        // ── Batching : queue toutes les notifications puis flush en une seule passe
        foreach ($subscriptions as $sub) {
            try {
                $webPushSub = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->public_key,
                    'authToken' => $sub->auth_token,
                    'contentEncoding' => 'aesgcm',
                ]);

                $this->webPush->queueNotification($webPushSub, $jsonPayload);
            } catch (\Throwable $e) {
                Log::warning("[Push] Impossible de créer la subscription pour user #{$sub->user_id}: {$e->getMessage()}");
            }
        }

        // ── Flush : envoie toutes les notifications en parallèle
        try {
            foreach ($this->webPush->flush() as $report) {
                if (!$report->isSuccess()) {
                    $statusCode = $report->getResponse()?->getStatusCode();
                    $endpoint = $report->getEndpoint();

                    // 404/410 = abonnement expiré → on le supprime de la base
                    if (in_array($statusCode, [404, 410])) {
                        PushSubscription::where('user_id', $userId)
                            ->where('endpoint', $endpoint)
                            ->delete();
                        Log::info("[Push] Abonnement expiré (user #{$userId}), suppression.");
                    } else {
                        Log::warning("[Push] Échec envoi (user #{$userId}): {$report->getReason()}");
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::error('[Push] Exception lors du flush: ' . $e->getMessage());
        }
    }
}
