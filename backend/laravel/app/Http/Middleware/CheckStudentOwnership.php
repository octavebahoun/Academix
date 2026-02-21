<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckStudentOwnership
{

    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('web')->check()) {
            return response()->json([
                'message' => 'Non authentifié.'
            ], 401);
        }

        $user = Auth::guard('web')->user();

        $user_id = $request->route('user_id') ?? $request->input('user_id');

        if ($user_id && $user->id != $user_id) {
            return response()->json([
                'message' => 'Non autorisé. Vous n\'avez accès qu\'à vos propres données.'
            ], 403);
        }

        return $next($request);
    }
}
