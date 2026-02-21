<?php
/**
 * GUIDE D'UTILISATION DES MIDDLEWARES
 * 
 * Les middlewares sont enregistrés dans bootstrap/app.php
 * 
 * ============================================
 * MIDDLEWARES DISPONIBLES
 * ============================================
 * 
 * 1. 'admin' 
 *    - Vérifie que l'utilisateur est un administrateur (super_admin OU chef_departement)
 *    - Utilisation: Route::middleware('admin')->get(...)
 *    - Exemple: Listing les départements, statistiques générales
 * 
 * 2. 'super.admin'
 *    - Vérifie que l'utilisateur est un super administrateur (role = 'super_admin')
 *    - Utilisation: Route::middleware('super.admin')->get(...)
 *    - Exemple: Créer un département, créer un chef_departement, voir tous les logs
 * 
 * 3. 'chef.departement'
 *    - Vérifie que l'utilisateur est un chef de département (role = 'chef_departement')
 *    - Utilisation: Route::middleware('chef.departement')->get(...)
 *    - Exemple: Voir les étudiants de son département
 * 
 * 4. 'student'
 *    - Vérifie que l'utilisateur est un étudiant (guard 'web')
 *    - Utilisation: Route::middleware('student')->get(...)
 *    - Exemple: Voir ses notes, tâches, alertes
 * 
 * 5. 'admin.departement.owner'
 *    - Vérifie que l'admin accède uniquement à son département
 *    - Les super admins ont accès à tout
 *    - Les chefs de département ne peuvent accéder qu'à leur propre département
 *    - Utilisation: Route::middleware('admin.departement.owner')->get(...)
 * 
 * 6. 'student.owner'
 *    - Vérifie que l'étudiant accède uniquement à ses propres données
 *    - Utilisation: Route::middleware('student.owner')->get(...)
 * 
 * ============================================
 * EXEMPLES D'UTILISATION DANS routes/api.php
 * ============================================
 * 
 * // Routes pour les super admins uniquement
 * Route::middleware('super.admin')->group(function () {
 *     Route::post('/departements', [DepartementController::class, 'store']);
 *     Route::delete('/departements/{id}', [DepartementController::class, 'destroy']);
 *     Route::post('/admins', [AdminController::class, 'store']);
 * });
 * 
 * // Routes pour tous les administrateurs (super + chef)
 * Route::middleware('admin')->group(function () {
 *     Route::get('/statistiques', [StatistiqueController::class, 'index']);
 *     Route::get('/import-logs', [ImportLogController::class, 'index']);
 * });
 * 
 * // Routes pour les chefs de département
 * Route::middleware('chef.departement')->group(function () {
 *     Route::get('/etudiants', [EtudiantController::class, 'index']);
 *     Route::post('/etudiants', [EtudiantController::class, 'store']);
 * });
 * 
 * // Routes pour les étudiants
 * Route::middleware('student')->group(function () {
 *     Route::get('/mes-notes', [NoteController::class, 'mesNotes']);
 *     Route::get('/mes-taches', [TacheController::class, 'mesTaches']);
 *     Route::get('/mes-alertes', [AlerteController::class, 'mesAlertes']);
 * });
 * 
 * // Routes pour vérifier l'ownership
 * Route::middleware('student.owner')->group(function () {
 *     Route::get('/users/{user_id}/notes', [NoteController::class, 'userNotes']);
 *     Route::get('/users/{user_id}/taches', [TacheController::class, 'userTaches']);
 * });
 * 
 * ============================================
 * STRUCTURE DES RÔLES
 * ============================================
 * 
 * SUPER ADMIN (guard: admin, role: 'super_admin')
 *   - Créer des départements
 *   - Créer des chefs de département
 *   - Gérer tous les administrateurs
 *   - Voir tous les logs
 *   - Accès complet au système
 * 
 * CHEF DEPARTEMENT (guard: admin, role: 'chef_departement')
 *   - Voir les étudiants de son département
 *   - Importer des notes pour son département
 *   - Voir les statistiques de son département
 *   - Accès limité à son propre département
 *   - Propriété: departement_id
 * 
 * ETUDIANT (guard: web)
 *   - Voir ses propres notes
 *   - Voir ses propres tâches
 *   - Voir ses propres alertes
 *   - Accès limité à ses propres données
 *   - Propriété: user_id
 * 
 * ============================================
 * NOTES IMPORTANTES
 * ============================================
 * 
 * - Les middlewares retournent des réponses JSON pour les API
 * - Vérifier Auth::guard('admin')->user() et Auth::guard('web')->user()
 * - Les super admins contournent les restrictions de département
 * - Les méthodes isSuperAdmin() et isChefDepartement() sont dans le modèle Admin
 * - Les route parameters sont automatiquement vérifiés pour l'ownership
 * 
 */
