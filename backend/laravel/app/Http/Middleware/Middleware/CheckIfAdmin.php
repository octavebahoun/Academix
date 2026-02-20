<?php

namespace App\Http\Middleware\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckIfAdmin
{
    /**
     * Handle an incoming request.
     * Vérifie que l'utilisateur authentifié est un administrateur 
     * (super admin OU chef de département)
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

        // Vérifier que c'est un super admin OR chef de département
        if (!($admin->isSuperAdmin() || $admin->isChefDepartement())) {
            return response()->json([
                'message' => 'Non autorisé. Accès réservé aux administrateurs.'
            ], 403);
        }

        return $next($request);
    }
}
