<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImportLog;
use App\Models\User;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImportController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * IMPORTER DES ÉTUDIANTS VIA CSV
     * POST /api/v1/admin/import/etudiants
     * Accès : chef_departement | super_admin
     * Content-Type: multipart/form-data
     * ---------------------------------------------------------------
     *
     * Champ attendu : fichier 'file' (CSV, max 5MB)
     *
     * Format CSV attendu (avec en-tête) :
     *   matricule | nom | prenom | filiere_code | annee_admission
     *   ETU001    | DUPONT | Jean | L1-INFO-2026 | 2025
     *
     * Logique :
     *   1. Valider le fichier CSV (mimes:csv,txt, max:5120)
     *   2. Créer un ImportLog (statut='en_cours') pour tracer l'opération
     *   3. Parser le CSV avec League\Csv\Reader
     *   4. Pour chaque ligne :
     *      a. Valider les champs (matricule unique, filiere_code existe)
     *      b. Trouver la filière par code
     *      c. Créer l'User (sans email ni password → l'étudiant activera son compte)
     *      d. Incrémenter lignes_valides ou enregistrer dans erreurs_details
     *   5. Mettre à jour l'ImportLog (statut='termine', completed_at=now())
     *   6. Retourner le résumé de l'import
     *
     * ⚠️  Utiliser une transaction DB pour rollback si erreur globale :
     *     DB::transaction(fn() => [...])
     *
     * ⚠️  Ne pas importer si le matricule existe déjà (passer en erreur ou update selon règle)
     *
     * Retour (200) :
     * {
     *   "import_id": 5,
     *   "total": 100,
     *   "valides": 98,
     *   "erreurs": 2,
     *   "erreurs_details": [{ "ligne": 3, "raison": "Filière introuvable: L1-GC-XXX" }]
     * }
     * ---------------------------------------------------------------
     */
    public function importEtudiants(Request $request)
    {
        // TODO: Valider le fichier
        // $request->validate(['file' => 'required|file|mimes:csv,txt|max:5120']);

        // TODO: Créer l'ImportLog (trace de l'opération)
        // $log = ImportLog::create([
        //     'admin_id'    => $request->user()->id,
        //     'type_import' => 'etudiants',
        //     'fichier_nom' => $request->file('file')->getClientOriginalName(),
        //     'total_lignes'=> 0,
        //     'lignes_valides' => 0,
        //     'lignes_erreur'  => 0,
        //     'statut'      => 'en_cours',
        // ]);

        // TODO: Parser le CSV avec League\Csv
        // use League\Csv\Reader;
        // $csv = Reader::createFromPath($request->file('file')->getRealPath());
        // $csv->setHeaderOffset(0); // première ligne = en-tête
        // $records = $csv->getRecords(); // itérateur

        // TODO: Boucler sur les lignes et valider/insérer chaque étudiant
        // $erreurs = [];
        // $valides = 0;
        // foreach ($records as $index => $record) {
        //     try {
        //         $filiere = Filiere::where('code', $record['filiere_code'])->first();
        //         if (!$filiere) throw new \Exception("Filière '{$record['filiere_code']}' introuvable");
        //         if (User::where('matricule', $record['matricule'])->exists()) throw new \Exception("Matricule déjà existant");
        //         User::create([
        //             'matricule'       => $record['matricule'],
        //             'nom'             => $record['nom'],
        //             'prenom'          => $record['prenom'],
        //             'filiere_id'      => $filiere->id,
        //             'annee_admission' => $record['annee_admission'] ?? null,
        //             'password'        => \Hash::make(\Str::random(16)), // temporaire
        //             'is_active'       => false, // activé lors du register
        //         ]);
        //         $valides++;
        //     } catch (\Exception $e) {
        //         $erreurs[] = ['ligne' => $index + 2, 'raison' => $e->getMessage()];
        //     }
        // }

        // TODO: Mettre à jour le log d'import
        // $log->update([
        //     'total_lignes'   => $valides + count($erreurs),
        //     'lignes_valides' => $valides,
        //     'lignes_erreur'  => count($erreurs),
        //     'erreurs_details'=> $erreurs,
        //     'statut'         => 'termine',
        //     'completed_at'   => now(),
        // ]);

        // TODO: return response()->json([...résumé...]);
    }

    /**
     * ---------------------------------------------------------------
     * IMPORTER DES NOTES VIA CSV
     * POST /api/v1/admin/import/notes
     * Accès : chef_departement | super_admin
     * Content-Type: multipart/form-data
     * ---------------------------------------------------------------
     *
     * Format CSV attendu :
     *   matricule | matiere_code | note | note_max | type_evaluation | coefficient | date_evaluation | semestre | annee_academique
     *   ETU001    | ALGO101      | 14.5 | 20       | Devoir          | 2           | 2025-11-15      | S1       | 2025-2026
     *
     * Logique :
     *   1. Valider fichier CSV
     *   2. Créer ImportLog (type_import='notes')
     *   3. Parser CSV et pour chaque ligne :
     *      a. Trouver l'User par matricule
     *      b. Trouver la Matiere par code
     *      c. Valider note entre 0 et note_max
     *      d. Créer la Note avec import_id et created_by_admin_id
     *   4. Finaliser l'ImportLog
     *
     * ⚠️  Si la note existe déjà (même user + matiere + type + date) → gérer le doublon
     *     (ignorer ? écraser ? → à définir selon règle métier)
     * ---------------------------------------------------------------
     */
    public function importNotes(Request $request)
    {
        // TODO: Même logique que importEtudiants mais pour les notes
        // $request->validate(['file' => 'required|file|mimes:csv,txt|max:5120']);

        // TODO: Créer ImportLog type='notes' puis parser le CSV

        // TODO: Pour chaque ligne : trouver User par matricule, Matiere par code, créer Note
        // Note::create([
        //     'user_id'          => $user->id,
        //     'matiere_id'       => $matiere->id,
        //     'note'             => $record['note'],
        //     'note_max'         => $record['note_max'] ?? 20,
        //     'type_evaluation'  => $record['type_evaluation'],
        //     'coefficient'      => $record['coefficient'] ?? 1,
        //     'date_evaluation'  => $record['date_evaluation'],
        //     'semestre'         => $record['semestre'],
        //     'annee_academique' => $record['annee_academique'],
        //     'import_id'        => $log->id,
        //     'created_by_admin_id' => $request->user()->id,
        // ]);
    }

    /**
     * ---------------------------------------------------------------
     * HISTORIQUE DES IMPORTS
     * GET /api/v1/admin/import/history
     * Accès : admin authentifié
     * ---------------------------------------------------------------
     *
     * Comportement selon rôle :
     *   - super_admin      → voit tous les imports (tous admins)
     *   - chef_departement → voit uniquement ses propres imports
     *
     * Charger la relation 'admin' pour afficher qui a fait l'import.
     *
     * Conseil :
     *   ImportLog::with('admin:id,nom,prenom,role')
     *       ->when($admin->isChefDepartement(), fn($q) => $q->where('admin_id', $admin->id))
     *       ->latest()->paginate(15);
     *
     * Retour (200) : liste paginée d'ImportLog
     * ---------------------------------------------------------------
     */
    public function history(Request $request)
    {
        // TODO: Récupérer l'admin connecté
        // $admin = $request->user();

        // TODO: Récupérer l'historique filtré selon le rôle
        // $imports = ImportLog::with('admin:id,nom,prenom')
        //     ->when($admin->isChefDepartement(), fn($q) => $q->where('admin_id', $admin->id))
        //     ->latest()
        //     ->paginate(15);

        // TODO: return response()->json($imports);
    }

    /**
     * ---------------------------------------------------------------
     * DÉTAILS D'UN IMPORT
     * GET /api/v1/admin/import/{id}
     * Accès : admin (chef voit seulement ses imports)
     * ---------------------------------------------------------------
     *
     * Retourner tous les détails : total, valides, erreurs, erreurs_details (JSON),
     * statut, completed_at, et l'admin qui a lancé l'import.
     *
     * Retour (200) : ImportLog complet
     * Retour (404) : si $id inexistant
     * Retour (403) : si chef tente de voir un import qui n'est pas le sien
     * ---------------------------------------------------------------
     */
    public function show($id)
    {
        // TODO: Trouver l'import
        // $import = ImportLog::with('admin:id,nom,prenom,role')->findOrFail($id);

        // TODO: Vérifier accès (chef ne voit que ses propres imports)
        // $admin = request()->user();
        // if ($admin->isChefDepartement() && $import->admin_id !== $admin->id) {
        //     return response()->json(['error' => 'Accès refusé'], 403);
        // }

        // TODO: return response()->json($import);
    }

    /**
     * ---------------------------------------------------------------
     * TÉLÉCHARGER LE TEMPLATE CSV ÉTUDIANTS
     * GET /api/v1/admin/import/template/etudiants
     * Accès : admin authentifié
     * ---------------------------------------------------------------
     *
     * Génère et retourne un fichier CSV vide avec les colonnes correctes à remplir.
     *
     * Colonnes : matricule, nom, prenom, filiere_code, annee_admission
     *
     * Conseil :
     *   use League\Csv\Writer;
     *   $csv = Writer::createFromString();
     *   $csv->insertOne(['matricule','nom','prenom','filiere_code','annee_admission']);
     *   $csv->insertOne(['ETU001','EXEMPLE','Prénom','L1-INFO-2026','2025']); // ligne exemple
     *   return response($csv->toString(), 200, [
     *       'Content-Type'        => 'text/csv',
     *       'Content-Disposition' => 'attachment; filename="template_etudiants.csv"',
     *   ]);
     * ---------------------------------------------------------------
     */
    public function templateEtudiants()
    {
        // TODO: Générer le CSV template avec en-têtes et une ligne exemple
        // use League\Csv\Writer;
        // $csv = Writer::createFromString();
        // $csv->insertOne(['matricule', 'nom', 'prenom', 'filiere_code', 'annee_admission']);
        // $csv->insertOne(['ETU001', 'DUPONT', 'Jean', 'L1-INFO-2026', '2025']);
        // return response($csv->toString(), 200, [
        //     'Content-Type'        => 'text/csv',
        //     'Content-Disposition' => 'attachment; filename="template_etudiants.csv"',
        // ]);
    }

    /**
     * ---------------------------------------------------------------
     * TÉLÉCHARGER LE TEMPLATE CSV NOTES
     * GET /api/v1/admin/import/template/notes
     * Accès : admin authentifié
     * ---------------------------------------------------------------
     *
     * Colonnes : matricule, matiere_code, note, note_max, type_evaluation,
     *            coefficient, date_evaluation, semestre, annee_academique
     *
     * Valeurs possibles pour type_evaluation : Devoir | Partiel | TP | Projet | Examen
     * Valeurs possibles pour semestre : S1 | S2
     * ---------------------------------------------------------------
     */
    public function templateNotes()
    {
        // TODO: Générer le CSV template pour les notes
        // $csv = Writer::createFromString();
        // $csv->insertOne(['matricule','matiere_code','note','note_max','type_evaluation','coefficient','date_evaluation','semestre','annee_academique']);
        // $csv->insertOne(['ETU001','ALGO101','14.5','20','Devoir','2','2025-11-15','S1','2025-2026']);
        // return response($csv->toString(), 200, [
        //     'Content-Type'        => 'text/csv',
        //     'Content-Disposition' => 'attachment; filename="template_notes.csv"',
        // ]);
    }
}
