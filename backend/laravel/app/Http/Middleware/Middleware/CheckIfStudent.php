<?php

namespace App\Http\Middleware\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckIfStudent
{
    /**
     * Handle an incoming request.
     * Vérifie que l'utilisateur authentifié est un étudiant (user)
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifier si l'utilisateur est authentifié avec le garde 'web' (users/étudiants)
        if (!Auth::guard('web')->check()) {
            return response()->json([
                'message' => 'Non authentifié. Accès réservé aux étudiants.'
            ], 401);
        }

        $user = Auth::guard('web')->user();

        // Vérifier que l'utilisateur est actif
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Votre compte est désactivé.'
            ], 403);
        }

        return $next($request);
    }
}
