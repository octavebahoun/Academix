<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckIfStudent
{
    /**
     * Handle an incoming request.
     * Vérifie que l'utilisateur authentifié est un étudiant (user)
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Vérifier que l'utilisateur est bien un étudiant (instance de App\Models\User)
        if (!$user || !($user instanceof \App\Models\User)) {
            return response()->json([
                'message' => 'Non authentifié. Accès réservé aux étudiants.'
            ], 401);
        }

        // Vérifier que l'utilisateur est actif
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Votre compte est désactivé.'
            ], 403);
        }

        return $next($request);
    }
}
