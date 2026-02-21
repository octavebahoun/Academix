<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminDepartementOwnership
{

    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->user();

        if (!$admin) {
            return response()->json([
                'message' => 'Non authentifié.'
            ], 401);
        }

        if (method_exists($admin, 'isSuperAdmin') && $admin->isSuperAdmin()) {
            return $next($request);
        }

        if (method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement()) {

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
