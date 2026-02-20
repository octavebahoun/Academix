<?php

namespace App\Http\Middleware\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class ChefDepartement
{
    /**
     * Handle an incoming request.
     * Vérifie que l'utilisateur authentifié est un chef de département
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifier si l'utilisateur est authentifié avec le garde 'admin'
        if (!Auth::guard('admin')->check()) {
            return response()->json([
                'message' => 'Non authentifié. Accès réservé aux administrateurs.'
            ], 401);
        }

        $admin = Auth::guard('admin')->user();

        // Vérifier si c'est un chef de département
        if (!$admin->isChefDepartement()) {
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