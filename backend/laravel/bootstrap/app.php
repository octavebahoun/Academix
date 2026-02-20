<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enregistrer les middlewares pour les rôles et permissions
        $middleware->alias([
            'admin' => \App\Http\Middleware\Middleware\CheckIfAdmin::class,
            'super.admin' => \App\Http\Middleware\Middleware\CheckIfSuperAdmin::class,
            'chef.departement' => \App\Http\Middleware\Middleware\ChefDepartement::class,
            'student' => \App\Http\Middleware\Middleware\CheckIfStudent::class,
            'admin.departement.owner' => \App\Http\Middleware\Middleware\CheckAdminDepartementOwnership::class,
            'student.owner' => \App\Http\Middleware\Middleware\CheckStudentOwnership::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
