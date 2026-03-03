<?php

namespace App\Observers;

use App\Jobs\SendWebPushNotificationJob;
use App\Models\Alerte;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AlerteObserver
{

    public function created(Alerte $alerte): void
    {
        // ── 1. Webhook Socket.io → Node.js (temps réel in-app)
        $nodeUrl = config('services.node.url');
        $secret = config('services.node.webhook_secret');

        if (empty($nodeUrl)) {
            Log::warning('AlerteObserver : NODE_BACKEND_URL non configuré, webhook ignoré.');
        } else {
            try {
                Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'x-webhook-secret' => $secret ?? '',
                ])
                    ->timeout(5)
                    ->post("{$nodeUrl}/api/webhook/alerte", [
                        'user_id' => $alerte->user_id,
                        'type_alerte' => $alerte->type_alerte,
                        'niveau_severite' => $alerte->niveau_severite,
                        'titre' => $alerte->titre,
                        'message' => $alerte->message,
                        'alerte_id' => $alerte->id,
                        'actions_suggerees' => $alerte->actions_suggerees ?? [],
                    ]);

                Log::info("AlerteObserver : webhook envoyé → user_id={$alerte->user_id}, type={$alerte->type_alerte}");
            } catch (\Throwable $e) {
                Log::warning("AlerteObserver : échec webhook Socket.io — {$e->getMessage()}");
            }
        }

        // ── 2. Push VAPID natif (notification OS) — dispatché en ASYNC via Job
        $emoji = match ($alerte->niveau_severite) {
            'eleve' => '🔴',
            'moyen' => '🟡',
            default => '🟢',
        };

        SendWebPushNotificationJob::dispatch($alerte->user_id, [
            'title' => "{$emoji} {$alerte->titre}",
            'body' => $alerte->message,
            'url' => '/dashboard',
            'tag' => 'alerte-' . $alerte->id,
        ]);
    }
}
