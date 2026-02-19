<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tache;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TacheController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * LISTE DES TÂCHES DE L'ÉTUDIANT
     * GET /api/v1/student/taches
     * Accès : étudiant authentifié
     * ---------------------------------------------------------------
     *
     * Retourne les tâches de l'étudiant connecté, avec la matière associée si présente.
     *
     * Query string optionnels :
     *   ?statut=a_faire     → filtrer par statut (a_faire | en_cours | terminee)
     *   ?priorite=haute     → filtrer par priorité (basse | moyenne | haute)
     *   ?matiere_id=3       → filtrer par matière
     *
     * Trier par : date_limite ASC (les plus urgentes en premier), puis priorité DESC
     *
     * Conseil :
     *   Tache::with('matiere:id,nom,code')
     *       ->where('user_id', $request->user()->id)
     *       ->when($request->statut, fn($q,$s) => $q->where('statut', $s))
     *       ->when($request->priorite, fn($q,$p) => $q->where('priorite', $p))
     *       ->orderBy('date_limite')
     *       ->get();
     *
     * Retour (200) : liste de tâches
     * ---------------------------------------------------------------
     */
    public function index(Request $request)
    {
        // TODO: Récupérer les tâches de l'étudiant avec filtres
        // $taches = Tache::with('matiere:id,nom,code')
        //     ->where('user_id', $request->user()->id)
        //     ->when($request->statut, fn($q,$s) => $q->where('statut', $s))
        //     ->when($request->priorite, fn($q,$p) => $q->where('priorite', $p))
        //     ->when($request->matiere_id, fn($q,$m) => $q->where('matiere_id', $m))
        //     ->orderBy('date_limite')
        //     ->get();

        // TODO: return response()->json($taches);
    }

    /**
     * ---------------------------------------------------------------
     * CRÉER UNE TÂCHE
     * POST /api/v1/student/taches
     * Accès : étudiant authentifié
     * ---------------------------------------------------------------
     *
     * Body attendu (JSON) :
     *   - titre       (required|string|max:255)
     *   - description (nullable|string)
     *   - matiere_id  (nullable|integer|exists:matieres,id)
     *   - date_limite (required|date|after:now)  ← doit être dans le futur
     *   - priorite    (sometimes|in:basse,moyenne,haute)  → défaut: 'moyenne'
     *   - statut      (parfois omis → défaut: 'a_faire')
     *
     * ⚠️  Forcer user_id = $request->user()->id (ne pas permettre à l'étudiant
     *     de créer une tâche pour quelqu'un d'autre).
     *
     * ⚠️  Si matiere_id est fourni, vérifier que cette matière appartient
     *     bien à la filière de l'étudiant (via filiere_matieres) pour cohérence.
     *
     * Retour : 201 Created + tâche créée avec matière
     * ---------------------------------------------------------------
     */
    public function store(Request $request)
    {
        // TODO: Valider les champs
        // $validated = $request->validate([
        //     'titre'       => 'required|string|max:255',
        //     'description' => 'nullable|string',
        //     'matiere_id'  => 'nullable|integer|exists:matieres,id',
        //     'date_limite' => 'required|date|after:now',
        //     'priorite'    => 'sometimes|in:basse,moyenne,haute',
        // ]);

        // TODO: Forcer user_id et statut initial
        // $validated['user_id'] = $request->user()->id;
        // $validated['statut']  = 'a_faire';

        // TODO: Créer et retourner
        // $tache = Tache::create($validated);
        // return response()->json($tache->load('matiere:id,nom,code'), 201);
    }

    /**
     * ---------------------------------------------------------------
     * MODIFIER UNE TÂCHE
     * PUT /api/v1/student/taches/{id}
     * Accès : étudiant authentifié (propriétaire uniquement)
     * ---------------------------------------------------------------
     *
     * Body (tous optionnels via 'sometimes') :
     *   - titre, description, matiere_id, date_limite, priorite, statut
     *
     * ⚠️  Vérifier que la tâche appartient bien à l'étudiant connecté :
     *     $tache->user_id !== $request->user()->id → 403 Forbidden
     *
     * ⚠️  Ne pas permettre de changer user_id.
     *
     * Retour : 200 OK + tâche mise à jour
     * ---------------------------------------------------------------
     */
    public function update(Request $request, $id)
    {
        // TODO: Trouver la tâche et vérifier la propriété
        // $tache = Tache::findOrFail($id);
        // if ($tache->user_id !== $request->user()->id) {
        //     return response()->json(['error' => 'Accès refusé'], 403);
        // }

        // TODO: Valider les champs modifiables
        // $validated = $request->validate([
        //     'titre'       => 'sometimes|string|max:255',
        //     'description' => 'nullable|string',
        //     'matiere_id'  => 'nullable|integer|exists:matieres,id',
        //     'date_limite' => 'sometimes|date',
        //     'priorite'    => 'sometimes|in:basse,moyenne,haute',
        //     'statut'      => 'sometimes|in:a_faire,en_cours,terminee',
        // ]);

        // TODO: $tache->update($validated);
        // return response()->json($tache->load('matiere:id,nom,code'));
    }

    /**
     * ---------------------------------------------------------------
     * SUPPRIMER UNE TÂCHE
     * DELETE /api/v1/student/taches/{id}
     * Accès : étudiant authentifié (propriétaire uniquement)
     * ---------------------------------------------------------------
     *
     * Vérifier que la tâche appartient à l'étudiant avant de supprimer.
     * Pas de soft delete → suppression définitive.
     *
     * Retour : 204 No Content
     * ---------------------------------------------------------------
     */
    public function destroy($id)
    {
        // TODO: Trouver la tâche et vérifier la propriété
        // $tache = Tache::findOrFail($id);
        // if ($tache->user_id !== request()->user()->id) {
        //     return response()->json(['error' => 'Accès refusé'], 403);
        // }

        // TODO: $tache->delete();
        // return response()->noContent();
    }

    /**
     * ---------------------------------------------------------------
     * MARQUER UNE TÂCHE COMME TERMINÉE
     * PATCH /api/v1/student/taches/{id}/complete
     * Accès : étudiant authentifié (propriétaire uniquement)
     * ---------------------------------------------------------------
     *
     * Action rapide (sans body) : met le statut à 'terminee'.
     * Alternative à update() pour une action fréquente et simple.
     *
     * Comportement :
     *   $tache->update(['statut' => 'terminee'])
     *
     * Retour (200) :
     * { "message": "Tâche marquée comme terminée", "tache": {...} }
     * ---------------------------------------------------------------
     */
    public function complete($id)
    {
        // TODO: Trouver la tâche et vérifier la propriété
        // $tache = Tache::findOrFail($id);
        // if ($tache->user_id !== request()->user()->id) {
        //     return response()->json(['error' => 'Accès refusé'], 403);
        // }

        // TODO: Marquer comme terminée
        // $tache->update(['statut' => 'terminee']);
        // return response()->json([
        //     'message' => 'Tâche marquée comme terminée',
        //     'tache'   => $tache,
        // ]);
    }
}
