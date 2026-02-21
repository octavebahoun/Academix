<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminDepartementOwnership
{
    /**
     * Handle an incoming request.
     * Vérifie que le chef de département accède uniquement aux ressources de son département
     * 
     * Les super admins ont accès à tout.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->user();

        if (!$admin) {
            return response()->json([
                'message' => 'Non authentifié.'
            ], 401);
        }

        // Les super admins ont accès à tout
        if (method_exists($admin, 'isSuperAdmin') && $admin->isSuperAdmin()) {
            return $next($request);
        }

        // Pour les chefs de département
        if (method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement()) {
            // Vérifier si un departement_id est fourni en paramètre
            $departement_id = $request->route('departement_id') ?? $request->input('departement_id');

            if ($departement_id && $admin->departement_id != $departement_id) {
                return response()->json([
                    'message' => 'Non autorisé. Vous n\'avez accès qu\'au département ' . $admin->departement_id
                ], 403);
            }

            return $next($request);
        }

        return response()->json([
            'message' => 'Non autorisé.'
        ], 403);
    }
}
