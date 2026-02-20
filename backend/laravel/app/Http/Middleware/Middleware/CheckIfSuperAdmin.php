<?php

namespace App\Http\Middleware\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckIfSuperAdmin
{
    /**
     * Handle an incoming request.
     * Vérifie que l'utilisateur authentifié est un super admin
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

        // Vérifier si c'est un super admin
        if (!$admin->isSuperAdmin()) {
            return response()->json([
                'message' => 'Non autorisé. Accès réservé aux super administrateurs.'
            ], 403);
        }

        return $next($request);
    }
}
