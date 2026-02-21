<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Departement;
use App\Models\Filiere;
use App\Models\Note;
use App\Models\User;
use App\Models\ImportLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatistiqueController extends Controller
{

    public function global(Request $request)
    {
        $admin = $request->user();
        if ($admin && method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement()) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $moyenneGenerale = Note::join('matieres', 'notes.matiere_id', '=', 'matieres.id')
            ->select(DB::raw('SUM(notes.note * matieres.coefficient) / SUM(matieres.coefficient) as moyenne'))
            ->value('moyenne');

        $usersAvecMoyenne = Note::join('matieres', 'notes.matiere_id', '=', 'matieres.id')
            ->select('user_id', DB::raw('SUM(notes.note * matieres.coefficient) / SUM(matieres.coefficient) as moyenne'))
            ->groupBy('user_id')
            ->get();

        $totalUsersNote = $usersAvecMoyenne->count();
        $usersReussite = $usersAvecMoyenne->where('moyenne', '>=', 10)->count();
        $tauxReussite = $totalUsersNote > 0 ? round(($usersReussite / $totalUsersNote) * 100, 2) : 0;

        $departements = Departement::withCount(['filieres', 'chefs'])->get();

        $stats = [
            'total_departements' => Departement::count(),
            'total_filieres'     => Filiere::count(),
            'total_etudiants'    => User::where('is_active', true)->count(),
            'moyenne_generale'   => round((float)$moyenneGenerale, 2),
            'taux_reussite'      => $tauxReussite,
            'departements'       => $departements,
        ];

        return response()->json($stats);
    }

    public function departement(Request $request, $id)
    {
        $admin = $request->user();

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $admin->departement_id != $id) {
            return response()->json(['message' => 'Accès refusé. Ce n\'est pas votre département.'], 403);
        }

        $departement = Departement::with('filieres')->findOrFail($id);
        $filiereIds = $departement->filieres->pluck('id');

        $total_etudiants = User::whereIn('filiere_id', $filiereIds)->count();

        $userIds = User::whereIn('filiere_id', $filiereIds)->pluck('id');

        $moyenneGenerale = 0;
        $tauxReussite = 0;

        if ($userIds->isNotEmpty()) {
            $moyenneGenerale = Note::whereIn('user_id', $userIds)
                ->join('matieres', 'notes.matiere_id', '=', 'matieres.id')
                ->select(DB::raw('SUM(notes.note * matieres.coefficient) / SUM(matieres.coefficient) as moyenne'))
                ->value('moyenne');

             $usersAvecMoyenne = Note::whereIn('user_id', $userIds)
                ->join('matieres', 'notes.matiere_id', '=', 'matieres.id')
                ->select('user_id', DB::raw('SUM(notes.note * matieres.coefficient) / SUM(matieres.coefficient) as moyenne'))
                ->groupBy('user_id')
                ->get();

            $totalUsersNote = $usersAvecMoyenne->count();
            if ($totalUsersNote > 0) {
                 $usersReussite = $usersAvecMoyenne->where('moyenne', '>=', 10)->count();
                 $tauxReussite = round(($usersReussite / $totalUsersNote) * 100, 2);
            }
        }

        return response()->json([
            'departement' => $departement,
            'total_filieres' => $filiereIds->count(),
            'total_etudiants' => $total_etudiants,
            'moyenne_generale' => round((float)$moyenneGenerale, 2),
            'taux_reussite' => $tauxReussite,
        ]);
    }

    public function filiere(Request $request, $id)
    {
        $filiere = Filiere::with('matieres')->findOrFail($id);
        $admin = $request->user();

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $filiere->departement_id != $admin->departement_id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $total_etudiants = User::where('filiere_id', $id)->count();
        $userIds = User::where('filiere_id', $id)->pluck('id');

        $matieresStats = [];
        if ($userIds->isNotEmpty()) {
            $matieresStats = Note::whereIn('user_id', $userIds)
                ->join('matieres', 'notes.matiere_id', '=', 'matieres.id')
                ->select(
                    'matiere_id',
                    'semestre',
                    'matieres.nom',
                    'matieres.code',
                    'matieres.coefficient',
                    DB::raw('AVG(notes.note) as moyenne'),
                    DB::raw('MIN(notes.note) as note_min'),
                    DB::raw('MAX(notes.note) as note_max'),
                    DB::raw('COUNT(CASE WHEN notes.note >= 10 THEN 1 END) * 100 / COUNT(*) as taux_reussite')
                )
                ->groupBy('matiere_id', 'semestre', 'matieres.nom', 'matieres.code', 'matieres.coefficient')
                ->get();
        }

        return response()->json([
            'filiere' => $filiere,
            'total_etudiants' => $total_etudiants,
            'matieres' => $matieresStats,
        ]);
    }

    public function dashboard(Request $request)
    {
        $admin = $request->user();
        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();

        if (!$isChef) {

            $moyenneGenerale = Note::join('matieres', 'notes.matiere_id', '=', 'matieres.id')
                ->select(DB::raw('SUM(notes.note * matieres.coefficient) / SUM(matieres.coefficient) as moyenne'))
                ->value('moyenne');

            $data = [
                'role' => 'super_admin',
                'resume' => [
                    'total_departements' => Departement::count(),
                    'total_filieres'     => Filiere::count(),
                    'total_etudiants'    => User::where('is_active', true)->count(),
                    'moyenne_generale'   => round((float)$moyenneGenerale, 2),
                ],

                'derniers_imports' => ImportLog::with('admin:id,nom,prenom')->latest()->take(5)->get(),
            ];
            return response()->json($data);
        } else {

            $deptId = $admin->departement_id;

            $filiereIds = Filiere::where('departement_id', $deptId)->pluck('id');
            $userIds = User::whereIn('filiere_id', $filiereIds)->pluck('id');

            $moyenneGenerale = 0;
            if ($userIds->isNotEmpty()) {
                $moyenneGenerale = Note::whereIn('user_id', $userIds)
                    ->join('matieres', 'notes.matiere_id', '=', 'matieres.id')
                    ->select(DB::raw('SUM(notes.note * matieres.coefficient) / SUM(matieres.coefficient) as moyenne'))
                    ->value('moyenne');
            }

            $etudiantsDifficulte = [];
            if ($userIds->isNotEmpty()) {
                 $usersMoyenne = Note::whereIn('user_id', $userIds)
                    ->join('matieres', 'notes.matiere_id', '=', 'matieres.id')
                    ->select('user_id', DB::raw('SUM(notes.note * matieres.coefficient) / SUM(matieres.coefficient) as moyenne'))
                    ->groupBy('user_id')
                    ->having('moyenne', '<', 10)
                    ->take(10)
                    ->get();

                 if ($usersMoyenne->isNotEmpty()) {
                     $uIds = $usersMoyenne->pluck('user_id');
                     $etudiantsDifficulte = User::whereIn('id', $uIds)->get()->map(function($u) use ($usersMoyenne) {
                         $u->moyenne = $usersMoyenne->firstWhere('user_id', $u->id)->moyenne;
                         return $u;
                     });
                 }
            }

            $data = [
                'role' => 'chef_departement',
                'resume' => [
                    'departement'      => Departement::find($deptId),
                    'total_filieres'   => $filiereIds->count(),
                    'total_etudiants'  => $userIds->count(),
                    'moyenne_generale' => round((float)$moyenneGenerale, 2),
                ],
                'etudiants_difficulte' => $etudiantsDifficulte,
                'derniers_imports' => ImportLog::where('admin_id', $admin->id)->latest()->take(5)->get(),
            ];

            return response()->json($data);
        }
    }
}
