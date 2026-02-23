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

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {

        Route::post('admin/register', [AuthController::class, 'adminRegister']);
        Route::post('admin/login', [AuthController::class, 'adminLogin']);
        Route::post('admin/logout', [AuthController::class, 'adminLogout'])->middleware('auth:sanctum');

        Route::post('chef/login', [AuthController::class, 'chefLogin']);
        Route::post('chef/logout', [AuthController::class, 'chefLogout'])->middleware('auth:sanctum');

        Route::post('student/register', [AuthController::class, 'studentRegister'])->middleware('auth:sanctum');
        Route::post('student/login', [AuthController::class, 'studentLogin']);
        Route::post('student/activate', [AuthController::class, 'studentActivate']);
        Route::post('student/logout', [AuthController::class, 'studentLogout'])->middleware('auth:sanctum');

        Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    });

    Route::prefix('admin')->middleware(['auth:sanctum', 'super.admin'])->group(function () {

        Route::prefix('departements')->group(function () {
            Route::get('', [DepartementController::class, 'index']);
            Route::post('', [DepartementController::class, 'store']);
            Route::get('{id}', [DepartementController::class, 'show']);
            Route::put('{id}', [DepartementController::class, 'update']);
            Route::delete('{id}', [DepartementController::class, 'destroy']);
            Route::get('{id}/stats', [StatistiqueController::class, 'departement']);
        });

        Route::prefix('chefs-departement')->group(function () {
            Route::get('', [ChefDepartementController::class, 'index']);
            Route::post('', [ChefDepartementController::class, 'store']);
            Route::get('{id}', [ChefDepartementController::class, 'show']);
            Route::put('{id}', [ChefDepartementController::class, 'update']);
            Route::delete('{id}', [ChefDepartementController::class, 'destroy']);
            Route::post('{id}/toggle', [ChefDepartementController::class, 'toggle']);
        });

        Route::get('stats/global', [StatistiqueController::class, 'global']);
        Route::get('stats/dashboard', [StatistiqueController::class, 'dashboard']);

        Route::apiResource('matieres', MatiereController::class)->names([
            'index' => 'admin.matieres.index',
            'store' => 'admin.matieres.store',
            'show' => 'admin.matieres.show',
            'update' => 'admin.matieres.update',
            'destroy' => 'admin.matieres.destroy'
        ]);

        Route::get('emploi-temps/filieres/{id}', [EmploiTempsController::class, 'index']);
        Route::apiResource('notes', NoteController::class)->names([
            'index' => 'admin.notes.index',
            'store' => 'admin.notes.store',
            'show' => 'admin.notes.show',
            'update' => 'admin.notes.update',
            'destroy' => 'admin.notes.destroy'
        ]);
        Route::apiResource('emploi-temps', EmploiTempsController::class)->names([
            'index' => 'admin.emploi-temps.index',
            'store' => 'admin.emploi-temps.store',
            'show' => 'admin.emploi-temps.show',
            'update' => 'admin.emploi-temps.update',
            'destroy' => 'admin.emploi-temps.destroy'
        ]);
    });

    Route::prefix('departement')->middleware(['auth:sanctum', 'admin', 'admin.departement.owner'])->group(function () {

        Route::apiResource('matieres', MatiereController::class)->names([
            'index' => 'departement.matieres.index',
            'store' => 'departement.matieres.store',
            'show' => 'departement.matieres.show',
            'update' => 'departement.matieres.update',
            'destroy' => 'departement.matieres.destroy'
        ]);

        Route::prefix('filieres')->group(function () {
            Route::get('', [FiliereController::class, 'index']);
            Route::post('', [FiliereController::class, 'store']);
            Route::get('{id}', [FiliereController::class, 'show']);
            Route::put('{id}', [FiliereController::class, 'update']);
            Route::delete('{id}', [FiliereController::class, 'destroy']);

            Route::post('{id}/matieres', [MatiereController::class, 'assignToFiliere']);
            Route::delete('{id}/matieres/{matiere_id}', [MatiereController::class, 'removeFromFiliere']);

            Route::get('{id}/etudiants', [FiliereController::class, 'etudiants']);
            Route::get('{id}/matieres', [FiliereController::class, 'matieres']);
            Route::get('{id}/stats', [StatistiqueController::class, 'filiere']);
            Route::get('{id}/emploi-temps', [EmploiTempsController::class, 'index']);
        });

        Route::get('etudiants', [StudentController::class, 'index']);
        Route::post('import/etudiants', [ImportController::class, 'importEtudiants']);
        Route::post('import/notes', [ImportController::class, 'importNotes']);
        Route::post('import/emploi-temps', [ImportController::class, 'importEmploiTemps']);
        Route::get('import/template/etudiants', [ImportController::class, 'templateEtudiants']);
        Route::get('import/template/notes', [ImportController::class, 'templateNotes']);
        Route::get('import/template/emploi-temps', [ImportController::class, 'templateEmploiTemps']);
        Route::get('import/history', [ImportController::class, 'history']);

        Route::apiResource('notes', NoteController::class)->names([
            'index' => 'departement.notes.index',
            'store' => 'departement.notes.store',
            'show' => 'departement.notes.show',
            'update' => 'departement.notes.update',
            'destroy' => 'departement.notes.destroy'
        ]);
        Route::apiResource('emploi-temps', EmploiTempsController::class)->names([
            'index' => 'departement.emploi-temps.index',
            'store' => 'departement.emploi-temps.store',
            'show' => 'departement.emploi-temps.show',
            'update' => 'departement.emploi-temps.update',
            'destroy' => 'departement.emploi-temps.destroy'
        ]);

        Route::get('dashboard', [StatistiqueController::class, 'dashboard']);
    });
    Route::prefix('student')->middleware(['auth:sanctum', 'student'])->group(function () {
        Route::get('profil', [StudentController::class, 'profil']);
        Route::get('moyennes', [StudentController::class, 'moyennes']);
        Route::get('notes', [StudentController::class, 'notes']);
        Route::get('emploi-temps', [StudentController::class, 'emploiTemps']);

        Route::patch('taches/{id}/complete', [TacheController::class, 'complete']);
        Route::apiResource('taches', TacheController::class);

        Route::get('alertes', [AlerteController::class, 'index']);
        Route::patch('alertes/{id}/read', [AlerteController::class, 'markAsRead']);
    });
});
