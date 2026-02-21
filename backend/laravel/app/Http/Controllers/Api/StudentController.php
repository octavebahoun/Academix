<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\User;
use App\Models\Filiere;
use App\Models\EmploiTempsFiliere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * LISTE DES ÉTUDIANTS (Niveau Département)
     * ---------------------------------------------------------------
     */
    public function index(Request $request)
    {
        $admin = $request->user();
        
        $etudiants = User::with('filiere')
            ->when($admin && method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement(), function($query) use ($admin) {
                // Return only students in the department
                $query->whereHas('filiere', function($q) use ($admin) {
                    $q->where('departement_id', $admin->departement_id);
                });
            })
            ->when($request->search, function($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%")
                      ->orWhere('matricule', 'like', "%{$search}%");
                });
            })
            ->orderBy('nom')
            ->paginate(20);

        return response()->json($etudiants);
    }

    /**
     * ---------------------------------------------------------------
     * PROFIL DE L'ÉTUDIANT CONNECTÉ
     * ---------------------------------------------------------------
     */
    public function profil(Request $request)
    {
        $user = $request->user()->load('filiere.departement');
        return response()->json($user);
    }

    /**
     * ---------------------------------------------------------------
     * METTRE À JOUR SON PROFIL
     * ---------------------------------------------------------------
     */
    public function updateProfil(Request $request)
    {
        $validated = $request->validate([
            'telephone'           => 'nullable|string|max:20',
            'photo'               => 'nullable|string|url',
            'objectif_moyenne'    => 'sometimes|numeric|min:0|max:20',
            'style_apprentissage' => 'sometimes|in:visuel,auditif,kinesthesique',
        ]);

        $request->user()->update($validated);
        return response()->json($request->user()->fresh()->load('filiere'));
    }

    /**
     * ---------------------------------------------------------------
     * MES NOTES (lecture seule)
     * ---------------------------------------------------------------
     */
    public function notes(Request $request)
    {
        $notes = Note::with('matiere:id,nom,code,coefficient')
            ->where('user_id', $request->user()->id)
            ->when($request->semestre, function($query, $semestre) {
                $query->where('semestre', $semestre);
            })
            ->when($request->annee_academique, function($query, $annee) {
                $query->where('annee_academique', $annee);
            })
            ->orderBy('date_evaluation')
            ->get();

        return response()->json($notes);
    }

    /**
     * ---------------------------------------------------------------
     * MES MOYENNES CALCULÉES
     * ---------------------------------------------------------------
     */
    public function moyennes(Request $request)
    {
        $user = $request->user();

        $parMatiere = Note::where('user_id', $user->id)
            ->join('matieres', 'notes.matiere_id', '=', 'matieres.id')
            ->select(
                'notes.matiere_id',
                'matieres.nom as matiere_nom',
                'matieres.coefficient',
                'notes.semestre',
                DB::raw('SUM(notes.note * notes.coefficient) / SUM(notes.coefficient) as moyenne_ponderee')
            )
            ->groupBy('notes.matiere_id', 'matieres.nom', 'matieres.coefficient', 'notes.semestre')
            ->get();

        // Organize the data and calculate general averages
        $semestres = [];
        $totalGeneralPonderee = 0;
        $totalGeneralCoeff = 0;

        foreach ($parMatiere as $matiere) {
            $sem = $matiere->semestre;
            if (!isset($semestres[$sem])) {
                $semestres[$sem] = [
                    'matieres' => [],
                    'total_ponderee' => 0,
                    'total_coeff' => 0,
                ];
            }
            
            $semestres[$sem]['matieres'][] = [
                'matiere_id' => $matiere->matiere_id,
                'nom' => $matiere->matiere_nom,
                'coefficient' => $matiere->coefficient,
                'moyenne' => round((float)$matiere->moyenne_ponderee, 2)
            ];

            $semestres[$sem]['total_ponderee'] += ($matiere->moyenne_ponderee * $matiere->coefficient);
            $semestres[$sem]['total_coeff'] += $matiere->coefficient;
            
            $totalGeneralPonderee += ($matiere->moyenne_ponderee * $matiere->coefficient);
            $totalGeneralCoeff += $matiere->coefficient;
        }

        $semestresFormatted = [];
        foreach ($semestres as $sem => $data) {
            $semestresFormatted[$sem] = [
                'moyenne' => $data['total_coeff'] > 0 ? round($data['total_ponderee'] / $data['total_coeff'], 2) : 0,
                'matieres' => $data['matieres']
            ];
        }

        $moyenneGenerale = $totalGeneralCoeff > 0 ? round($totalGeneralPonderee / $totalGeneralCoeff, 2) : 0;
        $objectif = (float)$user->objectif_moyenne ?? 0;

        return response()->json([
            'semestres' => $semestresFormatted,
            'moyenne_generale' => $moyenneGenerale,
            'objectif_moyenne' => $objectif,
            'ecart_objectif' => $objectif > 0 ? round($moyenneGenerale - $objectif, 2) : 0
        ]);
    }

    /**
     * ---------------------------------------------------------------
     * EMPLOI DU TEMPS DE MA FILIÈRE
     * ---------------------------------------------------------------
     */
    public function emploiTemps(Request $request)
    {
        $user = $request->user();
        $edt = EmploiTempsFiliere::with('matiere:id,nom,code')
            ->where('filiere_id', $user->filiere_id)
            ->when($request->semestre, function($query, $semestre) {
                $query->where('semestre', $semestre);
            })
            ->when($request->jour, function($query, $jour) {
                $query->where('jour', $jour);
            })
            ->orderByRaw("FIELD(jour, 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi')")
            ->orderBy('heure_debut')
            ->get();
            
        return response()->json($edt);
    }

    /**
     * ---------------------------------------------------------------
     * MATIÈRES DE MA FILIÈRE
     * ---------------------------------------------------------------
     */
    public function matieres(Request $request)
    {
        $user = $request->user();
        $filiere = Filiere::with(['matieres' => function($query) {
                $query->withPivot('semestre');
            }])
            ->find($user->filiere_id);
            
        return response()->json($filiere->matieres);
    }
}
