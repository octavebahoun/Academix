<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * PROFIL DE L'ÉTUDIANT CONNECTÉ
     * GET /api/v1/student/profil
     * Accès : étudiant authentifié
     * ---------------------------------------------------------------
     *
     * Retourne le profil complet de l'étudiant avec sa filière et son département.
     *
     * Champs à retourner : id, matricule, nom, prenom, email, telephone,
     *   photo, filiere (avec niveau, code, annee_academique, departement),
     *   annee_admission, objectif_moyenne, style_apprentissage, last_login
     *
     * Ne pas exposer : password, remember_token
     *
     * Conseil :
     *   $user = $request->user()->load('filiere.departement');
     *   return response()->json($user);
     * ---------------------------------------------------------------
     */
    public function profil(Request $request)
    {
        // TODO: Récupérer l'étudiant connecté avec ses relations
        // $user = $request->user()->load('filiere.departement');
        // return response()->json($user);
    }

    /**
     * ---------------------------------------------------------------
     * METTRE À JOUR SON PROFIL
     * PUT /api/v1/student/profil
     * Accès : étudiant authentifié
     * ---------------------------------------------------------------
     *
     * Body (JSON, tous optionnels) :
     *   - telephone          (nullable|string|max:20)
     *   - photo              (nullable|string|url) ← URL de la photo uploadée
     *   - objectif_moyenne   (sometimes|numeric|min:0|max:20)
     *   - style_apprentissage (sometimes|in:visuel,auditif,kinesthesique)
     *
     * ⚠️  L'étudiant ne peut PAS modifier : matricule, nom, prenom, email, filiere_id
     *     Ces champs sont gérés uniquement par l'admin via l'import CSV.
     *
     * Retour : 200 OK + profil mis à jour
     * ---------------------------------------------------------------
     */
    public function updateProfil(Request $request)
    {
        // TODO: Valider uniquement les champs modifiables par l'étudiant
        // $validated = $request->validate([
        //     'telephone'           => 'nullable|string|max:20',
        //     'photo'               => 'nullable|string|url',
        //     'objectif_moyenne'    => 'sometimes|numeric|min:0|max:20',
        //     'style_apprentissage' => 'sometimes|in:visuel,auditif,kinesthesique',
        // ]);

        // TODO: Mettre à jour uniquement ces champs autorisés
        // $request->user()->update($validated);
        // return response()->json($request->user()->fresh()->load('filiere'));
    }

    /**
     * ---------------------------------------------------------------
     * MES NOTES (lecture seule)
     * GET /api/v1/student/notes
     * Accès : étudiant authentifié
     * ---------------------------------------------------------------
     *
     * Retourne toutes les notes de l'étudiant connecté, groupées par semestre.
     *
     * Query string optionnels :
     *   ?semestre=S1              → filtrer par semestre (S1 ou S2)
     *   ?annee_academique=2025-2026 → filtrer par année
     *
     * Charger la relation 'matiere' pour afficher nom et coefficient.
     *
     * Conseil :
     *   Note::with('matiere:id,nom,code,coefficient')
     *       ->where('user_id', $request->user()->id)
     *       ->when($request->semestre, fn($q,$s) => $q->where('semestre', $s))
     *       ->when($request->annee_academique, fn($q,$a) => $q->where('annee_academique', $a))
     *       ->orderBy('semestre')->orderBy('date_evaluation')
     *       ->get();
     *
     * Retour (200) : liste de notes avec matière
     * ---------------------------------------------------------------
     */
    public function notes(Request $request)
    {
        // TODO: Récupérer les notes de l'étudiant avec filtres
        // $notes = Note::with('matiere:id,nom,code,coefficient')
        //     ->where('user_id', $request->user()->id)
        //     ->when($request->semestre, fn($q,$s) => $q->where('semestre', $s))
        //     ->when($request->annee_academique, fn($q,$a) => $q->where('annee_academique', $a))
        //     ->orderBy('date_evaluation')
        //     ->get();

        // TODO: return response()->json($notes);
    }

    /**
     * ---------------------------------------------------------------
     * MES MOYENNES CALCULÉES
     * GET /api/v1/student/moyennes
     * Accès : étudiant authentifié
     * ---------------------------------------------------------------
     *
     * Calcule et retourne les moyennes de l'étudiant :
     *   - Par matière et par semestre (pondérée par coefficient)
     *   - Moyenne générale S1, S2 et globale
     *
     * Formule moyenne pondérée :
     *   Σ(note × coefficient) / Σ(coefficient)
     *
     * Conseil (calcul SQL efficace) :
     *   Note::where('user_id', $user->id)
     *       ->join('matieres', 'notes.matiere_id', '=', 'matieres.id')
     *       ->select(
     *           'notes.matiere_id',
     *           'matieres.nom',
     *           'matieres.coefficient',
     *           'notes.semestre',
     *           DB::raw('SUM(notes.note * notes.coefficient) / SUM(notes.coefficient) as moyenne_ponderee'),
     *           DB::raw('MIN(notes.note) as note_min'),
     *           DB::raw('MAX(notes.note) as note_max'),
     *           DB::raw('COUNT(*) as nb_evaluations')
     *       )
     *       ->groupBy('notes.matiere_id', 'matieres.nom', 'matieres.coefficient', 'notes.semestre')
     *       ->get();
     *
     * Retour :
     * {
     *   "semestres": {
     *     "S1": { "moyenne": 13.5, "matieres": [...] },
     *     "S2": { "moyenne": 12.0, "matieres": [...] }
     *   },
     *   "moyenne_generale": 12.75,
     *   "objectif_moyenne": 14.0,
     *   "ecart_objectif": -1.25
     * }
     * ---------------------------------------------------------------
     */
    public function moyennes(Request $request)
    {
        // TODO: Récupérer l'étudiant et ses notes avec les matières
        // $user = $request->user();

        // TODO: Calculer les moyennes par matière × semestre (pondérées)
        // $parMatiere = Note::where('user_id', $user->id)
        //     ->join('matieres', 'notes.matiere_id', '=', 'matieres.id')
        //     ->select(
        //         'notes.matiere_id',
        //         'matieres.nom as matiere_nom',
        //         'matieres.coefficient',
        //         'notes.semestre',
        //         DB::raw('SUM(notes.note * notes.coefficient) / SUM(notes.coefficient) as moyenne_ponderee')
        //     )
        //     ->groupBy('notes.matiere_id', 'matieres.nom', 'matieres.coefficient', 'notes.semestre')
        //     ->get();

        // TODO: Calculer la moyenne générale S1, S2, globale
        // TODO: Calculer l'écart avec $user->objectif_moyenne

        // TODO: return response()->json([...]);
    }

    /**
     * ---------------------------------------------------------------
     * EMPLOI DU TEMPS DE MA FILIÈRE
     * GET /api/v1/student/emploi-temps
     * Accès : étudiant authentifié
     * ---------------------------------------------------------------
     *
     * Retourne l'emploi du temps de la filière de l'étudiant connecté.
     *
     * Query string optionnel :
     *   ?semestre=S1 → filtrer par semestre
     *   ?jour=Lundi  → filtrer par jour
     *
     * Récupérer filiere_id via $request->user()->filiere_id
     *
     * Conseil :
     *   EmploiTempsFiliere::with('matiere:id,nom,code')
     *       ->where('filiere_id', $user->filiere_id)
     *       ->when($request->semestre, ...)
     *       ->orderByRaw("FIELD(jour,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
     *       ->orderBy('heure_debut')
     *       ->get();
     * ---------------------------------------------------------------
     */
    public function emploiTemps(Request $request)
    {
        // TODO: Récupérer l'EDT de la filière de l'étudiant
        // $user = $request->user();
        // $edt = \App\Models\EmploiTempsFiliere::with('matiere:id,nom,code')
        //     ->where('filiere_id', $user->filiere_id)
        //     ->when($request->semestre, fn($q,$s) => $q->where('semestre', $s))
        //     ->when($request->jour, fn($q,$j) => $q->where('jour', $j))
        //     ->orderByRaw("FIELD(jour,'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
        //     ->orderBy('heure_debut')
        //     ->get();
        // return response()->json($edt);
    }

    /**
     * ---------------------------------------------------------------
     * MATIÈRES DE MA FILIÈRE
     * GET /api/v1/student/matieres
     * Accès : étudiant authentifié
     * ---------------------------------------------------------------
     *
     * Retourne les matières de la filière de l'étudiant via la table pivot filiere_matieres.
     *
     * Charger : id, nom, code, coefficient, enseignant, semestre (depuis le pivot)
     *
     * Conseil :
     *   $user = $request->user()->load('filiere.matieres');
     *   return response()->json($user->filiere->matieres);
     *
     * Ou pour avoir le semestre du pivot :
     *   Filiere::with(['matieres' => fn($q) => $q->withPivot('semestre')])
     *       ->find($user->filiere_id)
     *       ->matieres;
     * ---------------------------------------------------------------
     */
    public function matieres(Request $request)
    {
        // TODO: Récupérer les matières de la filière de l'étudiant avec le semestre pivot
        // $user = $request->user();
        // $filiere = \App\Models\Filiere::with(['matieres' => fn($q) => $q->withPivot('semestre')])
        //     ->find($user->filiere_id);
        // return response()->json($filiere->matieres);
    }
}
