<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ChefDepartement
{
    /**
     * Handle an incoming request.
     * Vérifie que l'utilisateur authentifié est un chef de département
     */
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->user();

        if (!$admin) {
            return response()->json([
                'message' => 'Non authentifié. Accès réservé aux administrateurs.'
            ], 401);
        }

        // Vérifier si c'est un chef de département
        if (!method_exists($admin, 'isChefDepartement') || !$admin->isChefDepartement()) {
            return response()->json([
                'message' => 'Non autorisé. Accès réservé aux chefs de département.'
            ], 403);
        }

        // Vérifier que le chef de département a bien un département associé
        if (!$admin->departement_id) {
            return response()->json([
                'message' => 'Erreur: le chef de département doit être assigné à un département.'
            ], 403);
        }

        return $next($request);
    }
}