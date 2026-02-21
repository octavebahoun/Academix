<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckIfSuperAdmin
{
    /**
     * Handle an incoming request.
     * Vérifie que l'utilisateur authentifié est un super admin
     */
    public function handle(Request $request, Closure $next): Response
    {
        // $request->user() est injecté par le middleware 'auth:sanctum' qui précède celui-ci.
        // C'est la façon correcte de récupérer l'utilisateur authentifié via un Bearer Token.
        $user = $request->user();

        // Vérifier que l'utilisateur est bien authentifié
        if (!$user) {
            return response()->json([
                'message' => 'Non authentifié. Accès réservé aux administrateurs.'
            ], 401);
        }

        // Vérifier que c'est bien un Super Admin (isSuperAdmin() est défini dans Admin.php)
        if (!$user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Non autorisé. Accès réservé aux super administrateurs.'
            ], 403);
        }

        return $next($request);
    }
}
