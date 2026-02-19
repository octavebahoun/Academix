<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Implémenter vérification rôle admin
        // Vérifier si admin connecté via guard 'admin'
        // Vérifier si son rôle est dans $roles autorisés
        // Si chef_departement, vérifier accès à son département uniquement
        
        return $next($request);
    }
}
