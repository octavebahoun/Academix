<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Departement;
use App\Models\Filiere;
use App\Models\Note;
use App\Models\User;
use App\Models\StatistiqueDepartement;
use App\Models\StatistiqueFiliere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatistiqueController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * STATISTIQUES GLOBALES (toute l'université)
     * GET /api/v1/admin/stats/global
     * Accès : super_admin uniquement
     * ---------------------------------------------------------------
     *
     * Données à retourner :
     *   - total_departements   : Departement::count()
     *   - total_filieres       : Filiere::count()
     *   - total_etudiants      : User::where('is_active', true)->count()
     *   - moyenne_generale     : moyenne de toutes les notes (Note::avg('note'))
     *   - taux_reussite        : % d'étudiants avec moyenne générale >= 10
     *   - departements[]       : pour chaque département → nom, nb filieres, nb étudiants, moyenne
     *
     * Exemple de réponse JSON :
     * {
     *   "total_departements": 4,
     *   "total_filieres": 12,
     *   "total_etudiants": 350,
     *   "moyenne_generale": 12.45,
     *   "taux_reussite": 68.5,
     *   "departements": [
     *     { "id": 1, "nom": "Informatique", "total_filieres": 4, "total_etudiants": 120, "moyenne": 13.2 }
     *   ]
     * }
     *
     * Conseil : utiliser DB::select() ou Eloquent avec withCount() et withAvg()
     * pour éviter le problème N+1 (chargement en masse).
     * ---------------------------------------------------------------
     */
    public function global(Request $request)
    {
        // TODO: Vérifier que l'admin connecté est super_admin
        // $admin = $request->user('admin' | 'sanctum');
        // if ($admin->role !== 'super_admin') return response()->json(['error' => 'Accès refusé'], 403);

        // TODO: Agréger les statistiques globales
        // $stats = [
        //     'total_departements' => Departement::count(),
        //     'total_filieres'     => Filiere::count(),
        //     'total_etudiants'    => User::where('is_active', true)->count(),
        //     'moyenne_generale'   => Note::avg('note'),
        //     'taux_reussite'      => ..., // calculer % étudiants >= 10 de moyenne
        //     'departements'       => Departement::withCount('filieres')
        //                                ->withCount('admins')
        //                                ->get(),
        // ];

        // TODO: return response()->json($stats);
    }

    /**
     * ---------------------------------------------------------------
     * STATISTIQUES D'UN DÉPARTEMENT
     * GET /api/v1/admin/stats/departement/{id}
     * Accès : super_admin (tous) | chef_departement (son dept uniquement)
     * ---------------------------------------------------------------
     *
     * Paramètre : $id = departement_id
     *
     * Données à retourner :
     *   - departement           : nom, code, description
     *   - total_filieres        : nombre de filières liées
     *   - total_etudiants       : User::whereHas('filiere', fn => filiere.departement_id == $id)
     *   - moyenne_generale      : moyenne de toutes les notes des étudiants du département
     *   - taux_reussite         : % avec moyenne >= 10
     *   - filieres[]            : par filière → nom, niveau, nb étudiants, moyenne, taux réussite
     *   - historique[]          : données de StatistiqueDepartement (si déjà calculées)
     *
     * Sécurité :
     *   Si l'admin est chef_departement, vérifier que $id == $admin->departement_id
     *   Sinon retourner 403 Forbidden.
     *
     * Conseil : charger le département avec ses filières en une seule requête :
     *   Departement::with(['filieres.users', 'statistiques'])->findOrFail($id)
     * ---------------------------------------------------------------
     */
    public function departement($id)
    {
        // TODO: Récupérer l'admin connecté
        // $admin = $request->user();

        // TODO: Vérifier accès (chef_departement ne voit que son département)
        // if ($admin->isChefDepartement() && $admin->departement_id != $id) {
        //     return response()->json(['error' => 'Accès refusé à ce département'], 403);
        // }

        // TODO: Trouver le département (404 si inexistant)
        // $departement = Departement::with(['filieres', 'statistiques'])->findOrFail($id);

        // TODO: Calculer les stats en temps réel ou lire depuis StatistiqueDepartement
        // Exemple : $moyenneGlobale = Note::whereHas('user.filiere', fn($q) => $q->where('departement_id', $id))
        //                                 ->avg('note');

        // TODO: return response()->json([...]);
    }

    /**
     * ---------------------------------------------------------------
     * STATISTIQUES D'UNE FILIÈRE
     * GET /api/v1/admin/stats/filiere/{id}
     * Accès : super_admin | chef_departement (si filière appartient à son dept)
     * ---------------------------------------------------------------
     *
     * Paramètre : $id = filiere_id
     *
     * Données à retourner :
     *   - filiere               : nom, niveau, code, annee_academique
     *   - total_etudiants       : User::where('filiere_id', $id)->count()
     *   - matieres[]            : pour chaque matière de la filière (via filiere_matieres) :
     *       - nom, code, coefficient
     *       - moyenne_s1, moyenne_s2
     *       - note_min, note_max
     *       - taux_reussite (% >= 10)
     *   - moyenne_s1            : moyenne générale semestre 1
     *   - moyenne_s2            : moyenne générale semestre 2
     *   - taux_reussite_s1      : %
     *   - taux_reussite_s2      : %
     *   - historique[]          : données de StatistiqueFiliere (cache calculé)
     *
     * Conseil : utiliser groupBy('semestre') après avoir joint notes + matieres
     * ---------------------------------------------------------------
     */
    public function filiere($id)
    {
        // TODO: Trouver la filière avec ses matières et statistiques
        // $filiere = Filiere::with(['matieres', 'users', 'statistiques'])->findOrFail($id);

        // TODO: Vérifier accès chef_departement (filiere->departement_id == admin->departement_id)

        // TODO: Pour chaque matière, calculer les stats par semestre
        // $statsParMatiere = Note::where('user_id', /* étudiants de cette filière */)
        //     ->select('matiere_id', 'semestre',
        //              DB::raw('AVG(note) as moyenne'),
        //              DB::raw('MIN(note) as note_min'),
        //              DB::raw('MAX(note) as note_max'),
        //              DB::raw('COUNT(CASE WHEN note >= 10 THEN 1 END) / COUNT(*) * 100 as taux_reussite'))
        //     ->groupBy('matiere_id', 'semestre')
        //     ->get();

        // TODO: return response()->json([...]);
    }

    /**
     * ---------------------------------------------------------------
     * DASHBOARD PERSONNALISÉ SELON LE RÔLE
     * GET /api/v1/admin/stats/dashboard
     * Accès : tout admin authentifié (contenu adapté selon rôle)
     * ---------------------------------------------------------------
     *
     * Logique d'affichage selon le rôle de l'admin connecté :
     *
     * 📌 Si super_admin → afficher :
     *   - Résumé global (nb départements, filieres, étudiants)
     *   - Top 3 départements par moyenne
     *   - Derniers imports CSV (ImportLog::latest()->take(5)->get())
     *   - Alertes récentes (nb alertes non lues par étudiant)
     *   - Évolution par année académique
     *
     * 📌 Si chef_departement → afficher :
     *   - Stats de SON département uniquement (admin->departement_id)
     *   - Ses filières avec nb étudiants et moyenne
     *   - Étudiants en difficulté (moyenne < 10)
     *   - Derniers imports qu'il a effectués (ImportLog::where('admin_id', $admin->id))
     *   - Alertes récentes de ses étudiants
     *
     * Conseil : utiliser $admin->role pour brancher la logique
     * ---------------------------------------------------------------
     */
    public function dashboard(Request $request)
    {
        // TODO: Récupérer l'admin connecté
        // $admin = $request->user();

        // TODO: Adapter le contenu selon le rôle
        // if ($admin->isSuperAdmin()) {
        //     // Dashboard super_admin : vue globale
        //     $data = [
        //         'total_departements' => Departement::count(),
        //         'total_filieres'     => Filiere::count(),
        //         'total_etudiants'    => User::where('is_active', true)->count(),
        //         'derniers_imports'   => ImportLog::with('admin')->latest()->take(5)->get(),
        //         // ...
        //     ];
        // } else {
        //     // Dashboard chef_departement : vue restreinte
        //     $deptId = $admin->departement_id;
        //     $data = [
        //         'departement'          => Departement::with('filieres')->find($deptId),
        //         'etudiants_difficulte' => ..., // moyenne < 10
        //         'derniers_imports'     => ImportLog::where('admin_id', $admin->id)->latest()->take(5)->get(),
        //         // ...
        //     ];
        // }

        // TODO: return response()->json($data);
    }
}
