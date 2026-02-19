<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploiTempsFiliere;
use App\Models\Filiere;
use Illuminate\Http\Request;

class EmploiTempsController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * LISTE DE L'EDT D'UNE FILIÈRE
     * GET /api/v1/admin/emploi-temps/filieres/{id}
     * Accès : admin authentifié (chef voit ses filières, super_admin voit tout)
     * ---------------------------------------------------------------
     *
     * Paramètre : $filiereId = l'ID de la filière (passé dans l'URL)
     *
     * Données à retourner : tous les cours de la filière, triés par jour puis heure_debut.
     * Chaque cours contient : id, filiere_id, matiere (nom, code), jour, heure_debut,
     *                         heure_fin, salle, type_cours (CM/TD/TP), enseignant, semestre
     *
     * Filtres optionnels via query string :
     *   ?semestre=S1   → filtrer par semestre
     *   ?jour=Lundi    → filtrer par jour
     *
     * Exemple de réponse :
     * [
     *   {
     *     "id": 1,
     *     "jour": "Lundi",
     *     "heure_debut": "08:00",
     *     "heure_fin": "10:00",
     *     "matiere": { "nom": "Algorithmique", "code": "ALGO101" },
     *     "salle": "B201",
     *     "type_cours": "CM",
     *     "enseignant": "Dr. AKANDE",
     *     "semestre": "S1"
     *   }
     * ]
     *
     * Conseil :
     *   EmploiTempsFiliere::with('matiere')
     *       ->where('filiere_id', $filiereId)
     *       ->when($request->semestre, fn($q, $s) => $q->where('semestre', $s))
     *       ->when($request->jour, fn($q, $j) => $q->where('jour', $j))
     *       ->orderBy('jour')->orderBy('heure_debut')
     *       ->get();
     * ---------------------------------------------------------------
     */
    public function index($filiereId)
    {
        // TODO: Vérifier que la filière existe (404 sinon)
        // $filiere = Filiere::findOrFail($filiereId);

        // TODO: Vérifier accès chef_departement (filiere->departement_id == admin->departement_id)

        // TODO: Récupérer les cours avec la matière associée
        // $edt = EmploiTempsFiliere::with('matiere')
        //     ->where('filiere_id', $filiereId)
        //     ->when($request->semestre, fn($q, $s) => $q->where('semestre', $s))
        //     ->when($request->jour,     fn($q, $j) => $q->where('jour', $j))
        //     ->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
        //     ->orderBy('heure_debut')
        //     ->get();

        // TODO: return response()->json($edt);
    }

    /**
     * ---------------------------------------------------------------
     * AJOUTER UN COURS À L'EDT
     * POST /api/v1/admin/emploi-temps
     * Accès : chef_departement (de la filière concernée) | super_admin
     * ---------------------------------------------------------------
     *
     * Champs attendus dans le body (JSON) :
     *   - filiere_id   (required|integer|exists:filieres,id)
     *   - matiere_id   (required|integer|exists:matieres,id)
     *   - jour         (required|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi)
     *   - heure_debut  (required|date_format:H:i)
     *   - heure_fin    (required|date_format:H:i|after:heure_debut)
     *   - salle        (nullable|string|max:50)
     *   - type_cours   (required|in:CM,TD,TP)
     *   - enseignant   (nullable|string|max:100)
     *   - semestre     (required|in:S1,S2)
     *
     * Validations métier à vérifier :
     *   - heure_fin doit être strictement après heure_debut
     *   - La matiere_id doit appartenir à la filière (via filiere_matieres)
     *   - Vérifier les conflits de salle : même salle, même jour, plage horaire qui se chevauche
     *
     * Retour : 201 Created + le cours créé avec les relations chargées
     * ---------------------------------------------------------------
     */
    public function store(Request $request)
    {
        // TODO: Valider les champs
        // $validated = $request->validate([
        //     'filiere_id'  => 'required|integer|exists:filieres,id',
        //     'matiere_id'  => 'required|integer|exists:matieres,id',
        //     'jour'        => 'required|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
        //     'heure_debut' => 'required|date_format:H:i',
        //     'heure_fin'   => 'required|date_format:H:i|after:heure_debut',
        //     'salle'       => 'nullable|string|max:50',
        //     'type_cours'  => 'required|in:CM,TD,TP',
        //     'enseignant'  => 'nullable|string|max:100',
        //     'semestre'    => 'required|in:S1,S2',
        // ]);

        // TODO: Vérifier que la matière est bien liée à la filière
        // $matiereLiee = DB::table('filiere_matieres')
        //     ->where('filiere_id', $validated['filiere_id'])
        //     ->where('matiere_id', $validated['matiere_id'])
        //     ->exists();
        // if (!$matiereLiee) return response()->json(['error' => 'Cette matière n\'appartient pas à cette filière'], 422);

        // TODO: (Optionnel) Vérifier conflit de salle au même horaire
        // $conflit = EmploiTempsFiliere::where('jour', $validated['jour'])
        //     ->where('salle', $validated['salle'])
        //     ->where('semestre', $validated['semestre'])
        //     ->where('heure_debut', '<', $validated['heure_fin'])
        //     ->where('heure_fin', '>', $validated['heure_debut'])
        //     ->exists();
        // if ($conflit) return response()->json(['error' => 'Conflit de salle détecté'], 409);

        // TODO: Créer le cours
        // $cours = EmploiTempsFiliere::create($validated);
        // return response()->json($cours->load('matiere'), 201);
    }

    /**
     * ---------------------------------------------------------------
     * MODIFIER UN COURS DE L'EDT
     * PUT /api/v1/admin/emploi-temps/{id}
     * Accès : chef_departement (du département de la filière) | super_admin
     * ---------------------------------------------------------------
     *
     * Paramètre : $id = id du cours dans emploi_temps_filieres
     *
     * Champs modifiables (tous optionnels avec 'sometimes') :
     *   - matiere_id, jour, heure_debut, heure_fin, salle, type_cours, enseignant, semestre
     *
     * Les mêmes validations que store() s'appliquent sur les champs fournis.
     * Ne pas permettre de changer filiere_id (on supprime et recrée dans ce cas).
     *
     * Retour : 200 OK + cours mis à jour avec relations
     * ---------------------------------------------------------------
     */
    public function update(Request $request, $id)
    {
        // TODO: Trouver le cours (404 si inexistant)
        // $cours = EmploiTempsFiliere::findOrFail($id);

        // TODO: Vérifier accès chef_departement (cours->filiere->departement_id == admin->departement_id)

        // TODO: Valider avec 'sometimes' pour les MAJ partielles
        // $validated = $request->validate([
        //     'matiere_id'  => 'sometimes|integer|exists:matieres,id',
        //     'jour'        => 'sometimes|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
        //     'heure_debut' => 'sometimes|date_format:H:i',
        //     'heure_fin'   => 'sometimes|date_format:H:i|after:heure_debut',
        //     'salle'       => 'nullable|string|max:50',
        //     'type_cours'  => 'sometimes|in:CM,TD,TP',
        //     'enseignant'  => 'nullable|string|max:100',
        //     'semestre'    => 'sometimes|in:S1,S2',
        // ]);

        // TODO: Mettre à jour et retourner
        // $cours->update($validated);
        // return response()->json($cours->load('matiere'));
    }

    /**
     * ---------------------------------------------------------------
     * SUPPRIMER UN COURS DE L'EDT
     * DELETE /api/v1/admin/emploi-temps/{id}
     * Accès : chef_departement (du département de la filière) | super_admin
     * ---------------------------------------------------------------
     *
     * Paramètre : $id = id du cours dans emploi_temps_filieres
     *
     * Pas de soft delete ici (le modèle n'a pas $timestamps non plus),
     * suppression définitive via delete().
     *
     * Retour : 204 No Content (pas de body)
     * ---------------------------------------------------------------
     */
    public function destroy($id)
    {
        // TODO: Trouver le cours (404 si inexistant)
        // $cours = EmploiTempsFiliere::findOrFail($id);

        // TODO: Vérifier accès chef_departement (cours->filiere->departement_id == admin->departement_id)
        // $cours->load('filiere');
        // if ($admin->isChefDepartement() && $cours->filiere->departement_id !== $admin->departement_id) {
        //     return response()->json(['error' => 'Accès refusé'], 403);
        // }

        // TODO: Supprimer et répondre 204
        // $cours->delete();
        // return response()->noContent();
    }
}
