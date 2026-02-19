<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepartementController;
use App\Http\Controllers\Api\ChefDepartementController;
use App\Http\Controllers\Api\FiliereController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\EmploiTempsController;
use App\Http\Controllers\Api\StatistiqueController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\TacheController;
use App\Http\Controllers\Api\AlerteController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    
    // ============================================
    // AUTHENTIFICATION
    // ============================================
    Route::prefix('auth')->group(function () {
        // Admin
        Route::post('admin/login', [AuthController::class, 'adminLogin']);
        Route::post('admin/logout', [AuthController::class, 'adminLogout'])->middleware('auth:sanctum');
        
        // Étudiant
        Route::post('student/register', [AuthController::class, 'studentRegister']);
        Route::post('student/login', [AuthController::class, 'studentLogin']);
        Route::post('student/logout', [AuthController::class, 'studentLogout'])->middleware('auth:sanctum');
        
        // Profil
        Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    });

    // ============================================
    // ROUTES ADMIN (Protected)
    // ============================================
    Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
        
        // SUPER ADMIN - Départements
        Route::apiResource('departements', DepartementController::class);
        Route::get('departements/{id}/stats', [DepartementController::class, 'stats']);
        
        // SUPER ADMIN - Chefs Département
        Route::apiResource('chefs-departement', ChefDepartementController::class);
        Route::post('chefs-departement/{id}/toggle', [ChefDepartementController::class, 'toggle']);
        
        // CHEF DÉPARTEMENT - Filières
        Route::apiResource('filieres', FiliereController::class);
        Route::get('filieres/{id}/etudiants', [FiliereController::class, 'etudiants']);
        Route::get('filieres/{id}/stats', [FiliereController::class, 'stats']);
        
        // CHEF DÉPARTEMENT - Matières
        Route::apiResource('matieres', MatiereController::class)->except(['show']);
        Route::post('filieres/{filiereId}/matieres', [MatiereController::class, 'assignToFiliere']);
        Route::delete('filieres/{filiereId}/matieres/{matiereId}', [MatiereController::class, 'removeFromFiliere']);
        
        // CHEF DÉPARTEMENT - Import CSV
        Route::prefix('import')->group(function () {
            Route::post('etudiants', [ImportController::class, 'importEtudiants']);
            Route::post('notes', [ImportController::class, 'importNotes']);
            Route::get('history', [ImportController::class, 'history']);
            Route::get('{id}', [ImportController::class, 'show']);
            Route::get('template/etudiants', [ImportController::class, 'templateEtudiants']);
            Route::get('template/notes', [ImportController::class, 'templateNotes']);
        });
        
        // CHEF DÉPARTEMENT - Emploi du temps
        Route::get('emploi-temps/filieres/{id}', [EmploiTempsController::class, 'index']);
        Route::post('emploi-temps', [EmploiTempsController::class, 'store']);
        Route::put('emploi-temps/{id}', [EmploiTempsController::class, 'update']);
        Route::delete('emploi-temps/{id}', [EmploiTempsController::class, 'destroy']);
        
        // Statistiques
        Route::prefix('stats')->group(function () {
            Route::get('global', [StatistiqueController::class, 'global']);
            Route::get('departement/{id}', [StatistiqueController::class, 'departement']);
            Route::get('filiere/{id}', [StatistiqueController::class, 'filiere']);
            Route::get('dashboard', [StatistiqueController::class, 'dashboard']);
        });
    });

    // ============================================
    // ROUTES ÉTUDIANT (Protected)
    // ============================================
    Route::prefix('student')->middleware(['auth:sanctum'])->group(function () {
        
        // Profil
        Route::get('profil', [StudentController::class, 'profil']);
        Route::put('profil', [StudentController::class, 'updateProfil']);
        
        // Notes & Moyennes (lecture seule)
        Route::get('notes', [StudentController::class, 'notes']);
        Route::get('moyennes', [StudentController::class, 'moyennes']);
        
        // Emploi du temps & Matières (lecture seule)
        Route::get('emploi-temps', [StudentController::class, 'emploiTemps']);
        Route::get('matieres', [StudentController::class, 'matieres']);
        
        // Tâches (CRUD complet)
        Route::apiResource('taches', TacheController::class);
        Route::patch('taches/{id}/complete', [TacheController::class, 'complete']);
        
        // Alertes (lecture + marquer lue)
        Route::get('alertes', [AlerteController::class, 'index']);
        Route::patch('alertes/{id}/read', [AlerteController::class, 'markAsRead']);
    });
});
