<?php
namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Filiere;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;

class FiliereController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * LISTE DES FILIÈRES
     * GET /api/v1/admin/filieres
     * Accès : admin authentifié
     * ---------------------------------------------------------------
     *
     * Comportement selon le rôle :
     *   - super_admin      → voit TOUTES les filières (de tous les départements)
     *   - chef_departement → voit UNIQUEMENT les filières de son département
     *                        ($admin->departement_id)
     *
     * Query string optionnels :
     *   ?niveau=L1               → filtrer par niveau (L1, L2, L3, M1, M2)
     *   ?annee_academique=2025-2026 → filtrer par année
     *
     * Conseil :
     *   Filiere::with('departement')
     *       ->withCount('users') // nombre d'étudiants inscrits
     *       ->when($admin->isChefDepartement(), fn($q) => $q->where('departement_id', $admin->departement_id))
     *       ->when($request->niveau, fn($q, $n) => $q->where('niveau', $n))
     *       ->orderBy('niveau')
     *       ->get();
     *
     * Retour (200) : liste de filières avec compteur étudiant
     * ---------------------------------------------------------------
     */
    public function index(Request $request)
    {
        // TODO: Construire la requête selon le rôle
        // $admin = $request->user();
        // $filieres = Filiere::with('departement')
        //     ->withCount('users')
        //     // ⚠️ isChefDepartement() et departement_id sont définis dans le modèle ChefDepartement.
        //     //    Si $admin est un Super Admin (modèle Admin), isChefDepartement() retourne false.
        //     //    Si $admin est un Chef (modèle ChefDepartement), departement_id est disponible.
        //     ->when($admin->isChefDepartement(), fn($q) => $q->where('departement_id', $admin->departement_id))
        //     ->when($request->niveau, fn($q, $n) => $q->where('niveau', $n))
        //     ->orderBy('departement_id')->orderBy('niveau')
        //     ->get();

        // TODO: return response()->json($filieres);
        $admin = $request->user();
        $filieres = Filiere::with('departement')
            ->withCount('users')
            ->when($admin->isChefDepartement(), fn($q) => $q->where('departement_id', $admin->departement_id))
            ->when($request->niveau, fn($q, $n) => $q->where('niveau', $n))
            ->orderBy('departement_id')->orderBy('niveau')
            ->get();
        return response()->json($filieres);
    }

    /**
     * ---------------------------------------------------------------
     * CRÉER UNE FILIÈRE
     * POST /api/v1/admin/filieres
     * Accès : chef_departement (crée dans son propre département) | super_admin
     * ---------------------------------------------------------------
     *
     * Body attendu (JSON) :
     *   - departement_id   (required|integer|exists:departements,id)
     *   - nom              (required|string|max:100)
     *   - niveau           (required|in:L1,L2,L3,M1,M2)
     *   - code             (required|string|max:20|unique:filieres,code)
     *   - annee_academique (required|string|max:20)  ex: "2025-2026"
     *   - description      (nullable|string)
     *
     * ⚠️  Si l'admin est chef_departement, forcer departement_id = $admin->departement_id
     *     pour éviter qu'il crée une filière dans un autre département.
     *
     * Retour : 201 Created + filière créée avec son département
     * ---------------------------------------------------------------
     */
    public function store(Request $request)
    {       
        $admin = $request->user();
        if ($admin->isChefDepartement()) {
            $request->merge(['departement_id' => $admin->departement_id]);
        }
        $validated = $request->validate([
            'departement_id' => 'required|integer|exists:departements,id',
            'nom'  => 'required|string|max:100',
            'niveau'  => 'required|in:L1,L2,L3,M1,M2',
            'code'  => 'required|string|max:20|unique:filieres,code',
            'annee_academique' => 'required|string|max:20',
            'description' => 'nullable|string',
        ]);
        $filiere = Filiere::create($validated);
        return response()->json($filiere->load('departement'), 201);
    }

    /**
     * ---------------------------------------------------------------
     * DÉTAILS D'UNE FILIÈRE
     * GET /api/v1/admin/filieres/{id}
     * Accès : admin (chef vérifie que c'est sa filière)
     * ---------------------------------------------------------------
     *
     * Charger :
     *   - departement : infos du département
     *   - matieres    : via la table pivot filiere_matieres (avec semestre)
     *   - users count : nombre d'étudiants inscrits
     *
     * Retour (200) : filière complète
     * Retour (404) : si $id inexistant
     * ---------------------------------------------------------------
     */
    public function show($id)
    {
        // TODO: Récupérer la filière avec ses relations
        // $filiere = Filiere::with(['departement', 'matieres'])
        //     ->withCount('users')
        //     ->findOrFail($id);

        // TODO: Vérifier accès chef_departement (filiere->departement_id == admin->departement_id)
        // $admin = request()->user();
        // if ($admin->isChefDepartement() && $filiere->departement_id !== $admin->departement_id) {
        //     return response()->json(['error' => 'Accès refusé'], 403);
        // }

        // TODO: return response()->json($filiere);
    }

    /**
     * ---------------------------------------------------------------
     * MODIFIER UNE FILIÈRE
     * PUT /api/v1/admin/filieres/{id}
     * Accès : chef_departement (sa filière) | super_admin
     * ---------------------------------------------------------------
     *
     * Body attendu (tous optionnels via 'sometimes') :
     *   - nom              (sometimes|string|max:100)
     *   - niveau           (sometimes|in:L1,L2,L3,M1,M2)
     *   - code             (sometimes|string|max:20|unique:filieres,code,{id})
     *   - annee_academique (sometimes|string|max:20)
     *   - description      (nullable|string)
     *
     * Ne pas permettre de changer departement_id (déplacer une filière = opération sensible).
     *
     * ⚠️  Pour l'unicité du code, utiliser Rule::unique('filieres','code')->ignore($id)
     * ---------------------------------------------------------------
     */
    public function update(Request $request, $id)
    {
        // TODO: Trouver la filière
        // $filiere = Filiere::findOrFail($id);

        // TODO: Vérifier accès chef
        // (voir logique show())

        // TODO: Valider
        // $validated = $request->validate([
        //     'nom'              => 'sometimes|string|max:100',
        //     'niveau'           => 'sometimes|in:L1,L2,L3,M1,M2',
        //     'code'             => ['sometimes', 'string', 'max:20', Rule::unique('filieres','code')->ignore($id)],
        //     'annee_academique' => 'sometimes|string|max:20',
        //     'description'      => 'nullable|string',
        // ]);

        // TODO: $filiere->update($validated);
        // return response()->json($filiere->load('departement'));
    }

    /**
     * ---------------------------------------------------------------
     * SUPPRIMER UNE FILIÈRE
     * DELETE /api/v1/admin/filieres/{id}
     * Accès : chef_departement (sa filière) | super_admin
     * ---------------------------------------------------------------
     *
     * ⚠️  Vérifier avant suppression :
     *   - Il ne doit plus y avoir d'étudiants inscrits dans cette filière
     *     → User::where('filiere_id', $id)->exists()
     *   Si des étudiants existent → retourner 409 Conflict
     *
     * La migration a onDelete('cascade') pour les matieres (filiere_matieres),
     * emploi_temps_filieres, et statistiques_filieres → suppression en cascade OK.
     *
     * Retour : 204 No Content
     * ---------------------------------------------------------------
     */
    public function destroy($id)
    {
        // TODO: Trouver la filière
        // $filiere = Filiere::withCount('users')->findOrFail($id);

        // TODO: Vérifier pas d'étudiants inscrits
        // if ($filiere->users_count > 0) {
        //     return response()->json([
        //         'error' => "Impossible : {$filiere->users_count} étudiant(s) inscrit(s) dans cette filière."
        //     ], 409);
        // }

        // TODO: $filiere->delete();
        // return response()->noContent();
    }

    /**
     * ---------------------------------------------------------------
     * LISTE DES ÉTUDIANTS D'UNE FILIÈRE
     * GET /api/v1/admin/filieres/{id}/etudiants
     * Accès : admin (chef vérifie sa filière)
     * ---------------------------------------------------------------
     *
     * Retourne les étudiants inscrits dans cette filière.
     *
     * Query string optionnels :
     *   ?search=dupont → filtrer par nom, prénom ou matricule
     *   ?is_active=1   → filtrer par statut actif/inactif
     *
     * Champs à retourner : id, matricule, nom, prenom, email, is_active, annee_admission
     * Ne pas exposer password, remember_token, etc.
     *
     * Conseil :
     *   User::select(['id','matricule','nom','prenom','email','is_active','annee_admission'])
     *       ->where('filiere_id', $id)
     *       ->when($request->search, fn($q, $s) =>
     *           $q->where('nom', 'like', "%$s%")
     *             ->orWhere('prenom', 'like', "%$s%")
     *             ->orWhere('matricule', 'like', "%$s%"))
     *       ->orderBy('nom')
     *       ->paginate(20);
     * ---------------------------------------------------------------
     */
    public function etudiants($id)
    {
        // TODO: Vérifier que la filière existe
        // $filiere = Filiere::findOrFail($id);

        // TODO: Vérifier accès chef

        // TODO: Récupérer les étudiants avec filtres et pagination
        // $etudiants = User::select(['id','matricule','nom','prenom','email','telephone','is_active','annee_admission','last_login'])
        //     ->where('filiere_id', $id)
        //     ->when($request->search, fn($q, $s) =>
        //         $q->where('nom', 'like', "%$s%")
        //           ->orWhere('prenom', 'like', "%$s%")
        //           ->orWhere('matricule', 'like', "%$s%"))
        //     ->when(isset($request->is_active), fn($q) => $q->where('is_active', $request->is_active))
        //     ->orderBy('nom')
        //     ->paginate(20);

        // TODO: return response()->json($etudiants);
    }

    /**
     * ---------------------------------------------------------------
     * STATISTIQUES D'UNE FILIÈRE
     * GET /api/v1/admin/filieres/{id}/stats
     * Accès : admin (chef vérifie sa filière)
     * ---------------------------------------------------------------
     *
     * Déléguer à StatistiqueController::filiere($id) ou dupliquer la logique.
     * Voir les commentaires détaillés dans StatistiqueController pour le contenu attendu.
     * ---------------------------------------------------------------
     */
    public function stats($id)
    {
        // TODO: Déléguer à la logique de StatistiqueController::filiere($id)
        // ou dupliquer ici la logique de calculs par semestre / matière.
    }
}
