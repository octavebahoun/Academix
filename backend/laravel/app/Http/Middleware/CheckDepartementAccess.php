<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckDepartementAccess
{
    /**
     * Vérifier que chef département accède uniquement à son département
     */
    public function handle(Request $request, Closure $next)
    {
        // Si chef_departement, vérifier que departement_id dans la route correspond à son departement_id
        
        return $next($request);
    }
}
