<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ChefDepartementController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * LISTE DES CHEFS DE DÉPARTEMENT
     * GET /api/v1/admin/chefs-departement
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     *
     * Retourne tous les admins avec role = 'chef_departement'.
     * Charger la relation departement pour afficher à quel département ils sont affectés.
     *
     * Conseil :
     *   Admin::with('departement')
     *       ->where('role', 'chef_departement')
     *       ->orderBy('nom')
     *       ->get();
     *
     * Retour (200) : liste des chefs avec leur département
     * ---------------------------------------------------------------
     */
    public function index(Request $request)
    {
        // TODO: Vérifier rôle super_admin
        // if ($request->user()->role !== 'super_admin') return response()->json(['error' => 'Accès refusé'], 403);

        // TODO: Récupérer les chefs de département
        // $chefs = Admin::with('departement')
        //     ->where('role', 'chef_departement')
        //     ->orderBy('nom')
        //     ->get();

        // TODO: return response()->json($chefs);
    }

    /**
     * ---------------------------------------------------------------
     * CRÉER UN CHEF DE DÉPARTEMENT
     * POST /api/v1/admin/chefs-departement
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     *
     * Body attendu (JSON) :
     *   - nom            (required|string|max:100)
     *   - prenom         (required|string|max:100)
     *   - email          (required|email|unique:admins,email)
     *   - password       (required|string|min:8)
     *   - telephone      (nullable|string|max:20)
     *   - departement_id (required|integer|exists:departements,id)
     *
     * Logique :
     *   1. Valider
     *   2. Vérifier qu'il n'y a pas déjà un chef actif pour ce département
     *      → Admin::where('departement_id', $deptId)->where('role', 'chef_departement')->where('is_active', true)->exists()
     *   3. Hasher le password
     *   4. Créer l'admin avec role = 'chef_departement'
     *
     * Retour : 201 Created + admin créé (sans le password)
     * ---------------------------------------------------------------
     */
    public function store(Request $request)
    {
        // TODO: Valider les champs
        // $validated = $request->validate([
        //     'nom'            => 'required|string|max:100',
        //     'prenom'         => 'required|string|max:100',
        //     'email'          => 'required|email|unique:admins,email',
        //     'password'       => 'required|string|min:8',
        //     'telephone'      => 'nullable|string|max:20',
        //     'departement_id' => 'required|integer|exists:departements,id',
        // ]);

        // TODO: Vérifier unicité chef actif par département (optionnel selon règle métier)
        // $dejaChef = Admin::where('departement_id', $validated['departement_id'])
        //     ->where('role', 'chef_departement')
        //     ->where('is_active', true)
        //     ->exists();
        // if ($dejaChef) {
        //     return response()->json(['error' => 'Ce département a déjà un chef actif'], 409);
        // }

        // TODO: Hasher le password et créer
        // $validated['password'] = Hash::make($validated['password']);
        // $validated['role']     = 'chef_departement';
        // $chef = Admin::create($validated);

        // TODO: return response()->json($chef->load('departement'), 201);
    }

    /**
     * ---------------------------------------------------------------
     * DÉTAILS D'UN CHEF DE DÉPARTEMENT
     * GET /api/v1/admin/chefs-departement/{id}
     * Accès : super_admin
     * ---------------------------------------------------------------
     *
     * Récupérer l'admin par $id, vérifier que c'est bien un chef_departement.
     * Charger : departement, importLogs (derniers imports)
     *
     * Retour (200) : admin + département + historique imports
     * Retour (404) : si $id inexistant ou pas un chef
     * ---------------------------------------------------------------
     */
    public function show($id)
    {
        // TODO: Trouver le chef (s'assurer que c'est bien un chef_departement)
        // $chef = Admin::where('id', $id)
        //     ->where('role', 'chef_departement')
        //     ->with(['departement', 'importLogs' => fn($q) => $q->latest()->take(10)])
        //     ->firstOrFail();

        // TODO: return response()->json($chef);
    }

    /**
     * ---------------------------------------------------------------
     * MODIFIER UN CHEF DE DÉPARTEMENT
     * PUT /api/v1/admin/chefs-departement/{id}
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     *
     * Body attendu (tous optionnels via 'sometimes') :
     *   - nom            (sometimes|string|max:100)
     *   - prenom         (sometimes|string|max:100)
     *   - email          (sometimes|email|unique:admins,email,{id})
     *   - password       (sometimes|string|min:8)  ← hasher si fourni
     *   - telephone      (nullable|string|max:20)
     *   - departement_id (sometimes|integer|exists:departements,id)
     *
     * ⚠️  Si password est fourni, le hasher avant de sauvegarder.
     * ---------------------------------------------------------------
     */
    public function update(Request $request, $id)
    {
        // TODO: Trouver le chef
        // $chef = Admin::where('id', $id)->where('role', 'chef_departement')->firstOrFail();

        // TODO: Valider les champs (ignorer email actuel pour l'unicité)
        // $validated = $request->validate([
        //     'nom'            => 'sometimes|string|max:100',
        //     'prenom'         => 'sometimes|string|max:100',
        //     'email'          => ['sometimes', 'email', Rule::unique('admins', 'email')->ignore($id)],
        //     'password'       => 'sometimes|string|min:8',
        //     'telephone'      => 'nullable|string|max:20',
        //     'departement_id' => 'sometimes|integer|exists:departements,id',
        // ]);

        // TODO: Hasher le nouveau password si fourni
        // if (isset($validated['password'])) {
        //     $validated['password'] = Hash::make($validated['password']);
        // }

        // TODO: Mettre à jour et retourner
        // $chef->update($validated);
        // return response()->json($chef->load('departement'));
    }

    /**
     * ---------------------------------------------------------------
     * SUPPRIMER UN CHEF DE DÉPARTEMENT
     * DELETE /api/v1/admin/chefs-departement/{id}
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     *
     * ⚠️  Ne pas supprimer si le chef a des imports en cours (ImportLog::where statut='en_cours').
     *     Sinon → supprimer le compte admin (et ses tokens Sanctum via cascade).
     *
     * Alternative recommandée : désactiver via toggle() plutôt que supprimer.
     *
     * Retour : 204 No Content
     * ---------------------------------------------------------------
     */
    public function destroy($id)
    {
        // TODO: Trouver le chef
        // $chef = Admin::where('id', $id)->where('role', 'chef_departement')->firstOrFail();

        // TODO: Vérifier pas d'import en cours
        // $importEnCours = $chef->importLogs()->where('statut', 'en_cours')->exists();
        // if ($importEnCours) {
        //     return response()->json(['error' => 'Import en cours, impossible de supprimer ce chef'], 409);
        // }

        // TODO: Supprimer les tokens Sanctum puis l'admin
        // $chef->tokens()->delete();
        // $chef->delete();
        // return response()->noContent();
    }

    /**
     * ---------------------------------------------------------------
     * ACTIVER / DÉSACTIVER UN CHEF DE DÉPARTEMENT
     * POST /api/v1/admin/chefs-departement/{id}/toggle
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     *
     * Inverse la valeur de is_active :
     *   - Si is_active = true  → passer à false (désactivation)
     *   - Si is_active = false → passer à true  (réactivation)
     *
     * Si désactivation : révoquer tous les tokens actifs du chef
     *   $chef->tokens()->delete()
     *
     * Retour (200) :
     * {
     *   "message": "Compte désactivé" | "Compte activé",
     *   "is_active": false | true
     * }
     * ---------------------------------------------------------------
     */
    public function toggle($id)
    {
        // TODO: Trouver le chef
        // $chef = Admin::where('id', $id)->where('role', 'chef_departement')->firstOrFail();

        // TODO: Inverser is_active
        // $chef->is_active = !$chef->is_active;
        // $chef->save();

        // TODO: Si désactivation, révoquer les tokens
        // if (!$chef->is_active) {
        //     $chef->tokens()->delete();
        //     $message = 'Compte désactivé';
        // } else {
        //     $message = 'Compte activé';
        // }

        // TODO: return response()->json(['message' => $message, 'is_active' => $chef->is_active]);
    }
}
