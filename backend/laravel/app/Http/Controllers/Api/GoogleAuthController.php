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

    /**
     * Redirige vers la page d'authentification Google.
     */
    public function redirectToGoogle()
    {
        return response()->json([
            'auth_url' => $this->googleService->getAuthUrl()
        ]);
    }

    /**
     * Gère le retour de l'authentification Google (Callback).
     */
    public function handleGoogleCallback(Request $request)
    {
        $code = $request->query('code');

        if (!$code) {
            return response()->json(['error' => "Code d'autorisation manquant"], 400);
        }

        try {
            $token = $this->googleService->fetchAccessTokenWithAuthCode($code);

            $user = $request->user();

            if (!$user) {
                return response()->json(['error' => 'Utilisateur non authentifié. Veuillez vous connecter avant de lier votre compte Google.'], 401);
            }

            // Mise à jour de l'utilisateur avec les jetons Google
            $updateData = [
                'google_access_token' => json_encode($token),
            ];

            if (isset($token['refresh_token'])) {
                $updateData['google_refresh_token'] = $token['refresh_token'];
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
}
