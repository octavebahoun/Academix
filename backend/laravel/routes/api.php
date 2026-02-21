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
|
| Règle d'organisation :
|   - AuthController  ➜ uniquement Login / Logout / Register / Me
|   - DepartementController ➜ tout ce qui concerne les départements
|   - ChefDepartementController ➜ tout ce qui concerne les chefs
|
| Ordre logique de création (imposé par la BDD) :
|   1. Super Admin se crée  (POST /auth/admin/register)
|   2. Super Admin crée un Département (POST /admin/departements)
|   3. Super Admin crée un Chef pour ce Département (POST /admin/chefs-departement)
|
*/

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {

        //  ADMIN 
        Route::post('admin/register', [AuthController::class, 'adminRegister']);
        Route::post('admin/login', [AuthController::class, 'adminLogin']);
        Route::post('admin/logout', [AuthController::class, 'adminLogout'])->middleware('auth:sanctum');

        //  CHEF DE DÉPARTEMENT
        Route::post('chef/login', [AuthController::class, 'chefLogin']);
        Route::post('chef/logout', [AuthController::class, 'chefLogout'])->middleware('auth:sanctum');

        // ÉTUDIANT 
        Route::post('student/register', [AuthController::class, 'studentRegister'])->middleware('auth:sanctum');
        Route::post('student/login', [AuthController::class, 'studentLogin']);
        Route::post('student/logout', [AuthController::class, 'studentLogout'])->middleware('auth:sanctum');
        // PROFIL DE L'UTILISATEUR CONNECTÉ (admin, chef, ou étudiant) 
        Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    });

    Route::prefix('admin')->middleware(['auth:sanctum', 'super.admin'])->group(function () {

        //  GESTION DES DÉPARTEMENTS
        Route::prefix('departements')->group(function () {
            Route::get('',[DepartementController::class,'index']);   // Lister tous
            Route::post('',[DepartementController::class,'store']);   // Créer un département
            Route::get('{id}',[DepartementController::class,'show']);    // Voir un département
            Route::put('{id}',[DepartementController::class,'update']);  // Modifier
            Route::delete('{id}',[DepartementController::class,'destroy']); // Supprimer
            Route::get('{id}/stats',[DepartementController::class,'stats']);   // Statistiques
        });

        // GESTION DES CHEFS DE DÉPARTEMENT
        Route::prefix('chefs-departement')->group(function () {
            Route::get('',[ChefDepartementController::class, 'index']);   // Lister
            Route::post('',[ChefDepartementController::class, 'store']);   // Créer (département requis)
            Route::get('{id}',[ChefDepartementController::class, 'show']);    // Voir un chef
            Route::put('{id}',[ChefDepartementController::class, 'update']);  // Modifier
            Route::delete('{id}',[ChefDepartementController::class, 'destroy']); // Supprimer
            Route::post('{id}/toggle',[ChefDepartementController::class, 'toggle']); // Activer/Désactiver
        });

        //  STATISTIQUES GLOBALES
        Route::get('stats/global', [StatistiqueController::class, 'global']);
        Route::get('stats/dashboard', [StatistiqueController::class, 'dashboard']);

        // GESTION DES MATIÈRES (Super Admin)
        Route::apiResource('matieres', MatiereController::class);
    });
    
    Route::prefix('departement')->middleware(['auth:sanctum', 'admin', 'admin.departement.owner'])->group(function () {
        // GESTION DES MATIÈRES (Chef de Département)
        Route::apiResource('matieres', MatiereController::class);
        
        //  GESTION DES FILIÈRES (dans son département uniquement)
        Route::prefix('filieres')->group(function () {
            Route::get('', [FiliereController::class, 'index']);
            Route::post('', [FiliereController::class, 'store']);
            Route::get('{id}', [FiliereController::class, 'show']);
            Route::put('{id}', [FiliereController::class, 'update']);
            Route::delete('{id}', [FiliereController::class, 'destroy']);
            
            // Assignation / Rétractation de matières à une filière
            Route::post('{id}/matieres', [MatiereController::class, 'assignToFiliere']);
            Route::delete('{id}/matieres/{matiere_id}', [MatiereController::class, 'removeFromFiliere']);
        });

        //  GESTION DES ÉTUDIANTS & NOTES
        Route::get('etudiants', [StudentController::class, 'index']);
        Route::post('import/etudiants', [ImportController::class, 'importEtudiants']);
        Route::post('import/notes', [ImportController::class, 'importNotes']);

        //  TABLEAU DE BORD DU DÉPARTEMENT
        Route::get('dashboard', [StatistiqueController::class, 'dashboard']);
    });
    Route::prefix('student')->middleware(['auth:sanctum', 'student'])->group(function () {
        Route::get('profil', [StudentController::class, 'profil']);
        Route::get('notes', [StudentController::class, 'notes']);
        Route::get('emploi-temps', [StudentController::class, 'emploiTemps']);

        //  TÂCHES PERSONNELLES
        Route::apiResource('taches', TacheController::class);
    });
});