<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Departement;
use Illuminate\Http\Request;

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
        // TODO: Vérifier rôle super_admin
        // if ($request->user()->role !== 'super_admin') return response()->json(['error' => 'Accès refusé'], 403);

        // TODO: Récupérer les départements avec compteurs
        // $departements = Departement::withCount(['filieres', 'admins'])
        //     ->when($request->search, fn($q, $s) => $q->where('nom', 'like', "%$s%")
        //                                               ->orWhere('code', 'like', "%$s%"))
        //     ->orderBy('nom')
        //     ->get();

        // TODO: return response()->json($departements);
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
        // TODO: Valider les champs
        // $validated = $request->validate([
        //     'nom'         => 'required|string|max:100',
        //     'code'        => 'required|string|max:10|unique:departements,code',
        //     'description' => 'nullable|string',
        // ]);

        // TODO: Créer et retourner
        // $departement = Departement::create($validated);
        // return response()->json($departement, 201);
    }

    /**
     * ---------------------------------------------------------------
     * DÉTAILS D'UN DÉPARTEMENT
     * GET /api/v1/admin/departements/{id}
     * Accès : super_admin
     * ---------------------------------------------------------------
     *
     * Charger avec les relations :
     *   Departement::with(['filieres', 'admins' => fn($q) => $q->select('id','nom','prenom','role','is_active')])
     *       ->findOrFail($id)
     *
     * Retour (200) : département + ses filières + ses admins
     * Retour (404) : si $id inexistant
     * ---------------------------------------------------------------
     */
    public function show($id)
    {
        // TODO: Récupérer le département avec ses relations
        // $departement = Departement::with(['filieres', 'admins', 'statistiques'])
        //     ->findOrFail($id);

        // TODO: return response()->json($departement);
    }

    /**
     * ---------------------------------------------------------------
     * MODIFIER UN DÉPARTEMENT
     * PUT /api/v1/admin/departements/{id}
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     *
     * Body attendu (JSON, tous optionnels via 'sometimes') :
     *   - nom         (sometimes|string|max:100)
     *   - code        (sometimes|string|max:10|unique:departements,code,{id}) ← ignorer l'actuel
     *   - description (nullable|string)
     *
     * ⚠️  Pour la règle unique du code, utiliser Rule::unique('departements','code')->ignore($id)
     *     pour ne pas rejeter le code existant de ce même département.
     * ---------------------------------------------------------------
     */
    public function update(Request $request, $id)
    {
        // TODO: Trouver le département
        // $departement = Departement::findOrFail($id);

        // TODO: Valider en excluant l'id courant pour l'unicité du code
        // $validated = $request->validate([
        //     'nom'         => 'sometimes|string|max:100',
        //     'code'        => ['sometimes','string','max:10', Rule::unique('departements','code')->ignore($id)],
        //     'description' => 'nullable|string',
        // ]);

        // TODO: Mettre à jour et retourner
        // $departement->update($validated);
        // return response()->json($departement);
    }

    /**
     * ---------------------------------------------------------------
     * SUPPRIMER UN DÉPARTEMENT
     * DELETE /api/v1/admin/departements/{id}
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     *
     * ⚠️  Avant de supprimer, vérifier qu'il n'y a pas de dépendances actives :
     *   - Filières encore liées (filiere.departement_id = $id)
     *   - Admins encore affectés (admin.departement_id = $id)
     *
     * Si dépendances → retourner 409 Conflict avec un message explicite.
     * Sinon → supprimer et retourner 204 No Content.
     *
     * Note : la migration a onDelete('cascade') pour les filieres et set null pour les admins,
     * mais il est préférable de le bloquer côté application pour informer l'utilisateur.
     * ---------------------------------------------------------------
     */
    public function destroy($id)
    {
        // TODO: Trouver le département
        // $departement = Departement::withCount('filieres')->findOrFail($id);

        // TODO: Vérifier qu'il n'y a aucune filière active
        // if ($departement->filieres_count > 0) {
        //     return response()->json([
        //         'error' => 'Impossible de supprimer : ce département contient des filières actives.'
        //     ], 409);
        // }

        // TODO: Supprimer
        // $departement->delete();
        // return response()->noContent();
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
