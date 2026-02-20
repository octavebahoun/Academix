<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChefDepartement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ChefDepartementController extends Controller
{
    // ---------------------------------------------------------------
    // LISTE DES CHEFS DE DÉPARTEMENT
    // GET /api/v1/admin/chefs-departement
    // Accès : super_admin uniquement (garanti par le middleware dans api.php)
    // ---------------------------------------------------------------
    public function index(Request $request)
    {
        // Récupérer tous les chefs avec leur département chargé
        // Note : le middleware 'super.admin' garantit déjà qu'on est un super admin
        $chefs = ChefDepartement::with('departement')
            ->orderBy('nom')
            ->get();

        return response()->json([
            'data' => $chefs
        ]);
    }

    // ---------------------------------------------------------------
    // CRÉER UN CHEF DE DÉPARTEMENT
    // POST /api/v1/admin/chefs-departement
    // Accès : super_admin uniquement
    //
    // ⚠️ ORDRE LOGIQUE : Le département doit exister AVANT d'appeler cette route
    //    Créer d'abord via POST /api/v1/admin/departements
    // ---------------------------------------------------------------
    public function store(Request $request)
    {
        // 1. Validation - "exists:departements,id" garantit que le département existe
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            // Email unique dans la table chefs_departement (et non dans super_admins)
            'email' => 'required|email|unique:chefs_departement,email',
            'password' => 'required|string|min:8',
            'telephone' => 'nullable|string|max:20',
            // Le département DOIT exister en BDD (impossible de créer un chef sans département)
            'departement_id' => 'required|integer|exists:departements,id',
        ]);

        // 2. Vérifier qu'il n'y a pas déjà un chef ACTIF pour ce département
        $dejaChef = ChefDepartement::where('departement_id', $validated['departement_id'])
            ->where('is_active', true)
            ->exists();

        if ($dejaChef) {
            return response()->json([
                'error' => 'Ce département a déjà un chef de département actif.'
            ], 409);
        }

        // 3. Hasher le mot de passe (jamais stocker en clair)
        $validated['password'] = Hash::make($validated['password']);

        // 4. Traçabilité : enregistrer qui a créé ce chef
        $validated['created_by_admin'] = $request->user()->id;

        // 5. Création en base de données
        $chef = ChefDepartement::create($validated);

        return response()->json([
            'message' => 'Chef de département créé avec succès !',
            'chef' => $chef->load('departement'),
        ], 201);
    }

    // ---------------------------------------------------------------
    // DÉTAILS D'UN CHEF DE DÉPARTEMENT
    // GET /api/v1/admin/chefs-departement/{id}
    // Accès : super_admin
    // ---------------------------------------------------------------
    public function show($id)
    {
        // Trouver le chef par son ID dans la table chefs_departement
        // findOrFail retourne automatiquement 404 si non trouvé
        $chef = ChefDepartement::with(['departement', 'createdByAdmin'])
            ->findOrFail($id);

        return response()->json($chef);
    }

    // ---------------------------------------------------------------
    // MODIFIER UN CHEF DE DÉPARTEMENT
    // PUT /api/v1/admin/chefs-departement/{id}
    // Accès : super_admin uniquement
    // ---------------------------------------------------------------
    public function update(Request $request, $id)
    {
        // Trouver le chef dans la table chefs_departement
        $chef = ChefDepartement::findOrFail($id);

        // Validation des champs (tous optionnels avec 'sometimes')
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'prenom' => 'sometimes|string|max:100',
            // Ignorer l'email actuel du même chef pour la règle d'unicité
            'email' => ['sometimes', 'email', Rule::unique('chefs_departement', 'email')->ignore($id)],
            'password' => 'sometimes|string|min:8',
            'telephone' => 'nullable|string|max:20',
            'departement_id' => 'sometimes|integer|exists:departements,id',
        ]);

        // Hasher le nouveau password si fourni
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $chef->update($validated);

        return response()->json([
            'message' => 'Chef de département mis à jour.',
            'chef' => $chef->load('departement'),
        ]);
    }

    // ---------------------------------------------------------------
    // SUPPRIMER UN CHEF DE DÉPARTEMENT
    // DELETE /api/v1/admin/chefs-departement/{id}
    // Accès : super_admin uniquement
    // ✅ Recommandation : préférer toggle() pour désactiver plutôt que supprimer
    // ---------------------------------------------------------------
    public function destroy($id)
    {
        $chef = ChefDepartement::findOrFail($id);

        // Révoquer tous les tokens Sanctum actifs avant suppression
        // (pour invalider immédiatement les sessions en cours)
        $chef->tokens()->delete();

        $chef->delete();

        return response()->noContent(); // 204 No Content
    }

    // ---------------------------------------------------------------
    // ACTIVER / DÉSACTIVER UN CHEF DE DÉPARTEMENT
    // POST /api/v1/admin/chefs-departement/{id}/toggle
    // Accès : super_admin uniquement
    //
    // Si désactivation → révoque tous les tokens actifs du chef
    // ---------------------------------------------------------------
    public function toggle($id)
    {
        $chef = ChefDepartement::findOrFail($id);

        // Inverser l'état actif/inactif
        $chef->is_active = !$chef->is_active;
        $chef->save();

        // Si le compte est désactivé, révoquer tous les tokens Sanctum actifs
        // (le chef ne pourra plus faire de requêtes authentifiées)
        if (!$chef->is_active) {
            $chef->tokens()->delete();
            $message = 'Compte désactivé. Sessions révoquées.';
        } else {
            $message = 'Compte réactivé.';
        }

        return response()->json([
            'message' => $message,
            'is_active' => $chef->is_active,
        ]);
    }
}
