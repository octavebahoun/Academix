<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckIfSuperAdmin
{

    public function handle(Request $request, Closure $next): Response
    {

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Non authentifié. Accès réservé aux administrateurs.'
            ], 401);
        }

        if (!$user->isSuperAdmin()) {
            return response()->json([
                'message' => 'Non autorisé. Accès réservé aux super administrateurs.'
            ], 403);
        }

        return $next($request);
    }
}
