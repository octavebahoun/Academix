<?php

namespace App\Http\Controllers\Api;

use App\Models\Departement;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DepartementController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * LISTE DES DÉPARTEMENTS
     * GET /api/v1/admin/departements
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     *
     * Retourne tous les départements avec le nombre de filières et d'admins associés.
     *
     * Query string optionnels :
     *   ?search=info → filtrer par nom ou code (LIKE)
     *
     * Conseil :
     *   Departement::withCount(['filieres', 'admins'])
     *       ->when($request->search, fn($q, $s) => $q->where('nom', 'like', "%$s%")
     *                                                  ->orWhere('code', 'like', "%$s%"))
     *       ->orderBy('nom')
     *       ->get();
     *
     * Retour (200) : tableau de départements
     * ---------------------------------------------------------------
     */
    public function index(Request $request)
    {
        $departements = Departement::withCount(['filieres', 'chefs'])
            ->when($request->search, fn($q, $s) => $q->where('nom', 'like', "%$s%")
                ->orWhere('code', 'like', "%$s%"))
            ->orderBy('nom')
            ->get();

        return response()->json(['data' => $departements]);
    }

    /**
     * ---------------------------------------------------------------
     * CRÉER UN DÉPARTEMENT
     * POST /api/v1/admin/departements
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     *
     * Body attendu (JSON) :
     *   - nom         (required|string|max:100)
     *   - code        (required|string|max:10|unique:departements,code)
     *   - description (nullable|string)
     *
     * Retour : 201 Created + département créé
     * ---------------------------------------------------------------
     */
    public function store(Request $request)
    {
        // 1. Vérifier que l'utilisateur est bien authentifié
        $admin = $request->user();
        if (!$admin) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        // 2. Seul le Super Admin peut créer un département
        if (!$admin->isSuperAdmin()) {
            return response()->json([
                'message' => 'Accès interdit. Seul un Super Administrateur peut créer un département.'
            ], 403);
        }

        // 3. Validation des données
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'code' => 'required|string|max:10|unique:departements,code',
            'description' => 'nullable|string',
        ]);

        // 4. Ajouter l'ID du créateur
        $validated['created_by'] = $admin->id;

        // 5. Création
        $departement = Departement::create($validated);

        // 6. Retour avec wrap 'data' pour le frontend
        return response()->json([
            'message' => 'Département créé avec succès.',
            'data' => $departement
        ], 201);
    }

    /**
     * ---------------------------------------------------------------
     * DÉTAILS D'UN DÉPARTEMENT
     * GET /api/v1/admin/departements/{id}
     * Accès : super_admin
     * ---------------------------------------------------------------
     */
    public function show($id)
    {
        $departement = Departement::with(['filieres', 'chefs'])
            ->findOrFail($id);

        return response()->json(['data' => $departement]);
    }

    /**
     * ---------------------------------------------------------------
     * MODIFIER UN DÉPARTEMENT
     * PUT /api/v1/admin/departements/{id}
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     */
    public function update(Request $request, $id)
    {
        $departement = Departement::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'code' => 'sometimes|string|max:10|unique:departements,code,' . $id,
            'description' => 'nullable|string',
        ]);

        $departement->update($validated);

        return response()->json([
            'message' => 'Département mis à jour avec succès.',
            'data' => $departement
        ]);
    }

    /**
     * ---------------------------------------------------------------
     * SUPPRIMER UN DÉPARTEMENT
     * DELETE /api/v1/admin/departements/{id}
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     */
    public function destroy($id)
    {
        $departement = Departement::withCount(['filieres', 'chefs'])->findOrFail($id);

        if ($departement->filieres_count > 0 || $departement->chefs_count > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer : ce département contient des filières ou des chefs actifs.'
            ], 409);
        }

        $departement->delete();
        return response()->noContent();
    }

    /**
     * ---------------------------------------------------------------
     * STATISTIQUES D'UN DÉPARTEMENT
     * GET /api/v1/admin/departements/{id}/stats
     * Accès : super_admin
     * ---------------------------------------------------------------
     *
     * Retourne les statistiques du département :
     *   - total filières, total étudiants actifs
     *   - moyenne générale (toutes filières confondues)
     *   - taux de réussite (% avec moyenne >= 10)
     *   - filieres[] : chaque filière avec sa moyenne et son taux
     *
     * Conseil : déléguer à StatistiqueController::departement() ou dupliquer la logique ici
     * selon l'architecture choisie (appel interne ou service partagé).
     * ---------------------------------------------------------------
     */
    public function stats($id)
    {
        // TODO: Déléguer à la logique de StatistiqueController ou la dupliquer ici
        // $departement = Departement::with(['filieres.users.notes'])->findOrFail($id);

        // TODO: Calculer les agrégats et retourner
    }
}
