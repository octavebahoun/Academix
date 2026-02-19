<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Matiere;
use App\Models\Filiere;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MatiereController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * LISTE DES MATIÈRES
     * GET /api/v1/admin/matieres
     * Accès : admin authentifié
     * ---------------------------------------------------------------
     *
     * Retourne le pool global de matières avec nombre de filières liées.
     *
     * Query string optionnel :
     *   ?search=algo → filtrer par nom ou code (LIKE)
     *
     * Conseil :
     *   Matiere::withCount('filieres')
     *       ->when($request->search, fn($q,$s) =>
     *           $q->where('nom','like',"%$s%")->orWhere('code','like',"%$s%"))
     *       ->orderBy('nom')->get();
     * ---------------------------------------------------------------
     */
    public function index(Request $request)
    {
        // TODO: Récupérer les matières
        // $matieres = Matiere::withCount('filieres')
        //     ->when($request->search, fn($q,$s) =>
        //         $q->where('nom','like',"%$s%")->orWhere('code','like',"%$s%"))
        //     ->orderBy('nom')->get();
        // return response()->json($matieres);
    }

    /**
     * ---------------------------------------------------------------
     * CRÉER UNE MATIÈRE
     * POST /api/v1/admin/matieres
     * Accès : chef_departement | super_admin
     * ---------------------------------------------------------------
     *
     * Body (JSON) :
     *   - nom         (required|string|max:100)
     *   - code        (required|string|max:20|unique:matieres,code)
     *   - coefficient (sometimes|integer|min:1|max:10)  → défaut: 1
     *   - description (nullable|string)
     *   - enseignant  (nullable|string|max:100)
     *
     * La matière est créée dans un pool global (non liée à une filière ici).
     * Utiliser assignToFiliere() pour l'attacher ensuite.
     *
     * Retour : 201 Created + matière créée
     * ---------------------------------------------------------------
     */
    public function store(Request $request)
    {
        // TODO: Valider
        // $validated = $request->validate([
        //     'nom'         => 'required|string|max:100',
        //     'code'        => 'required|string|max:20|unique:matieres,code',
        //     'coefficient' => 'sometimes|integer|min:1|max:10',
        //     'description' => 'nullable|string',
        //     'enseignant'  => 'nullable|string|max:100',
        // ]);
        // $matiere = Matiere::create($validated);
        // return response()->json($matiere, 201);
    }

    /**
     * ---------------------------------------------------------------
     * MODIFIER UNE MATIÈRE
     * PUT /api/v1/admin/matieres/{id}
     * Accès : chef_departement | super_admin
     * ---------------------------------------------------------------
     *
     * Body (tous optionnels via 'sometimes') :
     *   - nom, code (unique sauf soi-même), coefficient, description, enseignant
     *
     * ⚠️  Pour l'unicité du code : Rule::unique('matieres','code')->ignore($id)
     *
     * Retour : 200 OK + matière mise à jour
     * ---------------------------------------------------------------
     */
    public function update(Request $request, $id)
    {
        // TODO: Trouver la matière
        // $matiere = Matiere::findOrFail($id);

        // TODO: Valider (code unique en ignorant l'actuel)
        // $validated = $request->validate([
        //     'nom'         => 'sometimes|string|max:100',
        //     'code'        => ['sometimes','string','max:20', Rule::unique('matieres','code')->ignore($id)],
        //     'coefficient' => 'sometimes|integer|min:1|max:10',
        //     'description' => 'nullable|string',
        //     'enseignant'  => 'nullable|string|max:100',
        // ]);

        // TODO: $matiere->update($validated);
        // return response()->json($matiere);
    }

    /**
     * ---------------------------------------------------------------
     * SUPPRIMER UNE MATIÈRE
     * DELETE /api/v1/admin/matieres/{id}
     * Accès : super_admin uniquement (action sensible)
     * ---------------------------------------------------------------
     *
     * ⚠️  Bloquer si des notes existent pour cette matière :
     *   $matiere->notes()->count() > 0 → 409 Conflict
     *
     * La migration a onDelete cascade sur filiere_matieres et emploi_temps_filieres.
     *
     * Retour : 204 No Content
     * ---------------------------------------------------------------
     */
    public function destroy($id)
    {
        // TODO: Trouver la matière
        // $matiere = Matiere::findOrFail($id);

        // TODO: Vérifier pas de notes liées
        // if ($matiere->notes()->count() > 0) {
        //     return response()->json(['error' => 'Des notes existent pour cette matière'], 409);
        // }

        // TODO: $matiere->delete();
        // return response()->noContent();
    }

    /**
     * ---------------------------------------------------------------
     * ASSIGNER UNE MATIÈRE À UNE FILIÈRE
     * POST /api/v1/admin/filieres/{filiereId}/matieres
     * Accès : chef_departement (sa filière) | super_admin
     * ---------------------------------------------------------------
     *
     * Body (JSON) :
     *   - matiere_id (required|integer|exists:matieres,id)
     *   - semestre   (required|in:S1,S2)
     *
     * Logique :
     *   1. Vérifier filière existe et est accessible par l'admin
     *   2. Vérifier la combinaison (filiere_id, matiere_id) n'existe pas déjà
     *   3. Attacher via la relation pivot :
     *      $filiere->matieres()->attach($matiere_id, ['semestre' => $semestre])
     *
     * Retour : 201 Created | 409 Conflict si déjà assignée
     * ---------------------------------------------------------------
     */
    public function assignToFiliere(Request $request, $filiereId)
    {
        // TODO: Trouver la filière
        // $filiere = Filiere::findOrFail($filiereId);

        // TODO: Vérifier accès chef_departement
        // (filiere->departement_id == admin->departement_id)

        // TODO: Valider le body
        // $validated = $request->validate([
        //     'matiere_id' => 'required|integer|exists:matieres,id',
        //     'semestre'   => 'required|in:S1,S2',
        // ]);

        // TODO: Vérifier que la matière n'est pas déjà dans cette filière
        // if ($filiere->matieres()->where('matiere_id', $validated['matiere_id'])->exists()) {
        //     return response()->json(['error' => 'Matière déjà assignée à cette filière'], 409);
        // }

        // TODO: Attacher avec pivot semestre
        // $filiere->matieres()->attach($validated['matiere_id'], ['semestre' => $validated['semestre']]);
        // return response()->json(['message' => 'Matière assignée avec succès', 'semestre' => $validated['semestre']], 201);
    }

    /**
     * ---------------------------------------------------------------
     * RETIRER UNE MATIÈRE D'UNE FILIÈRE
     * DELETE /api/v1/admin/filieres/{filiereId}/matieres/{matiereId}
     * Accès : chef_departement (sa filière) | super_admin
     * ---------------------------------------------------------------
     *
     * ⚠️  Bloquer si des notes existent pour les étudiants de cette filière :
     *   Note::whereHas('user', fn($q) => $q->where('filiere_id', $filiereId))
     *       ->where('matiere_id', $matiereId)->exists()
     *
     * Sinon : $filiere->matieres()->detach($matiereId)
     *
     * Retour : 204 No Content | 409 Conflict
     * ---------------------------------------------------------------
     */
    public function removeFromFiliere($filiereId, $matiereId)
    {
        // TODO: Trouver la filière et vérifier accès
        // $filiere = Filiere::findOrFail($filiereId);

        // TODO: Vérifier que la matière est bien dans cette filière
        // if (!$filiere->matieres()->where('matiere_id', $matiereId)->exists()) {
        //     return response()->json(['error' => 'Matière non trouvée dans cette filière'], 404);
        // }

        // TODO: Vérifier pas de notes liées
        // $notesExistent = \App\Models\Note::whereHas('user', fn($q) => $q->where('filiere_id', $filiereId))
        //     ->where('matiere_id', $matiereId)->exists();
        // if ($notesExistent) {
        //     return response()->json(['error' => 'Des notes existent pour cette matière dans cette filière'], 409);
        // }

        // TODO: Détacher
        // $filiere->matieres()->detach($matiereId);
        // return response()->noContent();
    }
}
