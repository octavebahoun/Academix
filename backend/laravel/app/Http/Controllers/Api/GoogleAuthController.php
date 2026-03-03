<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GoogleApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GoogleAuthController extends Controller
{
    public function __construct(protected GoogleApiService $googleService)
    {
    }


    public function redirectToGoogle(Request $request)
    {
        $user = $request->user();
        $state = $this->generateOAuthState($user);

        return response()->json([
            'auth_url' => $this->googleService->getAuthUrl($state)
        ]);
    }

    public function handleGoogleCallback(Request $request)
    {
        $code = $request->input('code');
        $state = $request->input('state');

        if (!$code) {
            return response()->json(['error' => "Code d'autorisation manquant"], 400);
        }

        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Utilisateur non authentifié. Veuillez vous connecter avant de lier votre compte Google.'], 401);
        }

        // Vérification CSRF du state OAuth
        if (!$state || !$this->verifyOAuthState($state, $user)) {
            return response()->json(['error' => 'État OAuth invalide ou expiré. Veuillez réessayer.'], 400);
        }

        try {
            $token = $this->googleService->fetchAccessTokenWithAuthCode($code);

            // Mise à jour de l'utilisateur avec les jetons Google
            $updateData = [
                'google_access_token' => json_encode($token),
            ];

            if (isset($token['refresh_token'])) {
                $updateData['google_refresh_token'] = $token['refresh_token'];
            }

            // Récupérer l'ID Google depuis l'id_token
            $googleUserId = $this->googleService->fetchGoogleUserId($token);
            if ($googleUserId) {
                $updateData['google_id'] = $googleUserId;
            }

            $user->update($updateData);

            // Déclenche une première synchronisation de l'emploi du temps
            try {
                $this->googleService->syncEmploiTemps($user);
            } catch (\Exception $e) {
                Log::warning("Impossible de faire la synchro initiale du calendrier: " . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Compte Google connecté avec succès !'
            ]);

        } catch (\Exception $e) {
            Log::error("Erreur Google Callback: " . $e->getMessage());
            return response()->json(['error' => "Impossible de connecter le compte Google : " . $e->getMessage()], 500);
        }
    }

    /**
     * Retourne le statut de connexion Google de l'étudiant connecté.
     */
    public function googleStatus(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'connected' => !empty($user->google_access_token),
            'calendar_id' => $user->google_calendar_id,
            'task_list_id' => $user->google_task_list_id,
        ]);
    }

    /**
     * Déconnecte le compte Google de l'étudiant (révoque et supprime les jetons).
     */
    public function googleDisconnect(Request $request)
    {
        $user = $request->user();

        // Révoquer le token côté Google avant de le supprimer
        if ($user->google_access_token) {
            try {
                $this->googleService->revokeToken($user);
            } catch (\Exception $e) {
                Log::warning("Impossible de révoquer le token Google pour user #{$user->id}: " . $e->getMessage());
            }
        }

        $user->update([
            'google_access_token' => null,
            'google_refresh_token' => null,
            'google_id' => null,
            'google_calendar_id' => null,
            'google_task_list_id' => null,
        ]);

        return response()->json(['success' => true, 'message' => 'Compte Google déconnecté avec succès.']);
    }

    /**
     * Déclenche manuellement la synchronisation de l'emploi du temps vers Google Calendar.
     */
    public function googleSync(Request $request)
    {
        $user = $request->user();

        if (empty($user->google_access_token)) {
            return response()->json(['error' => 'Compte Google non connecté.'], 400);
        }

        try {
            $this->googleService->syncEmploiTemps($user);
            return response()->json(['success' => true, 'message' => 'Emploi du temps synchronisé avec succès !']);
        } catch (\Exception $e) {
            Log::error("Erreur synchro manuelle Google: " . $e->getMessage());
            return response()->json(['error' => 'Erreur lors de la synchronisation : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Génère un state OAuth signé avec HMAC pour la protection CSRF.
     */
    private function generateOAuthState($user): string
    {
        $payload = base64_encode(json_encode([
            'user_id' => $user->id,
            'ts' => time(),
        ]));
        $signature = hash_hmac('sha256', $payload, config('app.key'));
        return $payload . '.' . $signature;
    }

    /**
     * Vérifie que le state OAuth est valide (signature + expiration + utilisateur).
     */
    private function verifyOAuthState(string $fullState, $user): bool
    {
        $parts = explode('.', $fullState, 2);
        if (count($parts) !== 2)
            return false;

        [$payload, $signature] = $parts;
        $expectedSignature = hash_hmac('sha256', $payload, config('app.key'));

        if (!hash_equals($expectedSignature, $signature))
            return false;

        $data = json_decode(base64_decode($payload), true);
        if (!$data)
            return false;

        if (($data['user_id'] ?? null) !== $user->id)
            return false;

        // Le state expire après 10 minutes
        if (time() - ($data['ts'] ?? 0) > 600)
            return false;

        return true;
    }
}
