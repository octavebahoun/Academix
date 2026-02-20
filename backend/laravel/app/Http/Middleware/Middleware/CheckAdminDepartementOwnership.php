<?php

namespace App\Http\Middleware\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

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
        if (!Auth::guard('admin')->check()) {
            return response()->json([
                'message' => 'Non authentifié.'
            ], 401);
        }

        $admin = Auth::guard('admin')->user();

        // Les super admins ont accès à tout
        if ($admin->isSuperAdmin()) {
            return $next($request);
        }

        // Pour les chefs de département
        if ($admin->isChefDepartement()) {
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
