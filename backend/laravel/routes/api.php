<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\TacheController;
use App\Http\Controllers\Api\AlerteController;
use App\Http\Controllers\Api\ImportController;
use App\Http\Controllers\Api\FiliereController;
use App\Http\Controllers\Api\MatiereController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\DepartementController;
use App\Http\Controllers\Api\EmploiTempsController;
use App\Http\Controllers\Api\StatistiqueController;
use App\Http\Controllers\Api\ChefDepartementController;

/*
|--------------------------------------------------------------------------
| API Routes v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    
    // ============================================
    // AUTHENTIFICATION (Publique ou Sanctum)
    // ============================================
    Route::prefix('auth')->group(function () {
        Route::post('admin/register', [AuthController::class, 'adminRegister']);
        Route::post('admin/login', [AuthController::class, 'adminLogin']);
        Route::post('admin/logout', [AuthController::class, 'adminLogout'])->middleware('auth:sanctum');
        
        Route::post('student/register', [AuthController::class, 'studentRegister']);
        Route::post('student/login', [AuthController::class, 'studentLogin']);
        Route::post('student/logout', [AuthController::class, 'studentLogout'])->middleware('auth:sanctum');
        
        Route::post('ChefDepartement/logout', [AuthController::class, 'chefDepartementLogout'])->middleware('auth:sanctum');
        Route::post('departement/create',[AuthController::class, 'store']);
        // Profil actuel
        Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    });

    // ============================================
    // ROUTES SUPER ADMIN UNIQUEMENT
    // ============================================
    Route::prefix('admin')->middleware(['auth:sanctum', 'super.admin'])->group(function () {
        
        // 📋 GESTION DES DÉPARTEMENTS
        Route::prefix('departements')->group(function () {
            Route::get('', [DepartementController::class, 'index']);
            Route::post('', [DepartementController::class, 'store']);
            Route::get('{id}', [DepartementController::class, 'show']);
            Route::put('{id}', [DepartementController::class, 'update']);
            Route::delete('{id}', [DepartementController::class, 'destroy']);
            Route::get('{id}/stats', [DepartementController::class, 'stats']);
        });
        
        // 👨‍💼 GESTION DES CHEFS DE DÉPARTEMENT
        Route::prefix('chefs-departement')->group(function () {
            Route::get('', [ChefDepartementController::class, 'index']);
            Route::post('', [ChefDepartementController::class, 'store']); // Création par Super Admin
            Route::get('{id}', [ChefDepartementController::class, 'show']);
            Route::put('{id}', [ChefDepartementController::class, 'update']);
            Route::delete('{id}', [ChefDepartementController::class, 'destroy']);
            Route::post('{id}/toggle', [ChefDepartementController::class, 'toggle']);
        });
        
        // 📊 STATISTIQUES GLOBALES
        Route::get('stats/global', [StatistiqueController::class, 'global']);
        Route::get('stats/dashboard', [StatistiqueController::class, 'dashboard']);
    });

    // ============================================
    // ROUTES CHEF DE DÉPARTEMENT
    // ============================================
    Route::prefix('departement')->middleware(['auth:sanctum', 'chef.departement', 'admin.departement.owner'])->group(function () {
        
        // 📚 GESTION DES FILIÈRES
        Route::prefix('filieres')->group(function () {
            Route::get('', [FiliereController::class, 'index']);
            Route::post('', [FiliereController::class, 'store']);
            Route::get('{id}', [FiliereController::class, 'show']);
            Route::put('{id}', [FiliereController::class, 'update']);
            Route::delete('{id}', [FiliereController::class, 'destroy']);
        });
        
        // 📝 GESTION DES ÉTUDIANTS & NOTES
        Route::get('etudiants', [StudentController::class, 'index']);
        Route::post('import/etudiants', [ImportController::class, 'importEtudiants']);
        Route::post('import/notes', [ImportController::class, 'importNotes']);
        
        // 📊 STATS DÉPARTEMENTALES
        Route::get('dashboard', [StatistiqueController::class, 'dashboard']);
    });

    // ============================================
    // ROUTES ÉTUDIANT
    // ============================================
    Route::prefix('student')->middleware(['auth:sanctum', 'student'])->group(function () {
        Route::get('profil', [StudentController::class, 'profil']);
        Route::get('notes', [StudentController::class, 'notes']);
        Route::get('emploi-temps', [StudentController::class, 'emploiTemps']);
        
        // ✅ TÂCHES PERSONNELLES
        Route::apiResource('taches', TacheController::class);
    });
});