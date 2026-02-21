<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckIfAdmin
{
    /**
     * Handle an incoming request.
     * Vérifie que l'utilisateur authentifié est un administrateur 
     * (super admin OU chef de département)
     */
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->user();

        if (!$admin) {
            return response()->json([
                'message' => 'Non authentifié. Accès réservé aux administrateurs.'
            ], 401);
        }

        // Vérifier que c'est un super admin OR chef de département
        $isSuperAdmin = method_exists($admin, 'isSuperAdmin') && $admin->isSuperAdmin();
        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();

        if (!($isSuperAdmin || $isChef)) {
            return response()->json([
                'message' => 'Non autorisé. Accès réservé aux administrateurs.'
            ], 403);
        }

        return $next($request);
    }
}
