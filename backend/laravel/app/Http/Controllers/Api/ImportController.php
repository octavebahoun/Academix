<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImportLog;
use App\Models\User;
use App\Models\Note;
use App\Models\Filiere;
use App\Models\Matiere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use League\Csv\Reader;
use League\Csv\Writer;

class ImportController extends Controller
{

    public function importEtudiants(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:5120']);

        $admin = $request->user();

        $log = ImportLog::create([
            'admin_id' => $admin->id,
            'type_import' => 'etudiants',
            'fichier_nom' => $request->file('file')->getClientOriginalName(),
            'total_lignes' => 0,
            'lignes_valides' => 0,
            'lignes_erreur' => 0,
            'statut' => 'en_cours',
        ]);

        $csv = Reader::createFromPath($request->file('file')->getRealPath());
        $csv->setHeaderOffset(0);
        $records = $csv->getRecords();

        $erreurs = [];
        $valides = 0;

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();

        DB::beginTransaction();
        try {
            foreach ($records as $index => $record) {
                try {
                    if (!isset($record['matricule'], $record['nom'], $record['prenom'], $record['filiere_code'])) {
                        throw new \Exception("Champs obligatoires manquants.");
                    }

                    $filiere = Filiere::where('code', $record['filiere_code'])->first();
                    if (!$filiere) {
                        throw new \Exception("Filière '{$record['filiere_code']}' introuvable");
                    }

                    if ($isChef && $filiere->departement_id !== $admin->departement_id) {
                        throw new \Exception("La filière '{$record['filiere_code']}' n'appartient pas à votre département.");
                    }

                    if (User::where('matricule', $record['matricule'])->exists()) {
                        throw new \Exception("Matricule '{$record['matricule']}' déjà existant.");
                    }

                    User::create([
                        'matricule' => $record['matricule'],
                        'nom' => $record['nom'],
                        'prenom' => $record['prenom'],
                        'filiere_id' => $filiere->id,
                        'annee_admission' => $record['annee_admission'] ?? date('Y'),
                        'password' => Hash::make(Str::random(16)),
                        'is_active' => false,
                    ]);
                    $valides++;
                } catch (\Exception $e) {
                    $erreurs[] = ['ligne' => $index + 2, 'raison' => $e->getMessage()];
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $log->update(['statut' => 'echoue', 'completed_at' => now(), 'erreurs_details' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur critique lors de l\'import.', 'error' => $e->getMessage()], 500);
        }

        $log->update([
            'total_lignes' => $valides + count($erreurs),
            'lignes_valides' => $valides,
            'lignes_erreur' => count($erreurs),
            'erreurs_details' => empty($erreurs) ? null : $erreurs,
            'statut' => 'termine',
            'completed_at' => now(),
        ]);

        return response()->json([
            'import_id' => $log->id,
            'total' => $valides + count($erreurs),
            'valides' => $valides,
            'erreurs' => count($erreurs),
            'erreurs_details' => $erreurs
        ]);
    }

    public function importNotes(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:5120']);

        $admin = $request->user();

        $log = ImportLog::create([
            'admin_id' => $admin->id,
            'type_import' => 'notes',
            'fichier_nom' => $request->file('file')->getClientOriginalName(),
            'total_lignes' => 0,
            'lignes_valides' => 0,
            'lignes_erreur' => 0,
            'statut' => 'en_cours',
        ]);

        $csv = Reader::createFromPath($request->file('file')->getRealPath());
        $csv->setHeaderOffset(0);
        $records = $csv->getRecords();

        $erreurs = [];
        $valides = 0;

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();

        DB::beginTransaction();
        try {
            foreach ($records as $index => $record) {
                try {
                    $user = User::with('filiere')->where('matricule', $record['matricule'])->first();
                    if (!$user) {
                        if (empty($record['filiere_code'])) {
                            throw new \Exception("Étudiant introuvable et aucun 'filiere_code' fourni pour le créer.");
                        }

                        $filiereCreate = Filiere::where('code', $record['filiere_code'])->first();
                        if (!$filiereCreate) {
                            throw new \Exception("Impossible de créer l'étudiant: Filière '{$record['filiere_code']}' introuvable.");
                        }
                        if ($isChef && $filiereCreate->departement_id !== $admin->departement_id) {
                            throw new \Exception("La filière '{$record['filiere_code']}' n'appartient pas à votre département.");
                        }

                        $user = User::create([
                            'matricule' => $record['matricule'],
                            'nom' => $record['nom'] ?? 'N/A',
                            'prenom' => $record['prenom'] ?? 'N/A',
                            'filiere_id' => $filiereCreate->id,
                            'annee_admission' => date('Y'),
                            'password' => Hash::make(Str::random(16)),
                            'is_active' => false,
                        ]);
                        $user->load('filiere');
                    }

                    if ($isChef && $user->filiere && $user->filiere->departement_id !== $admin->departement_id) {
                        throw new \Exception("L'étudiant '{$record['matricule']}' n'appartient pas à votre département.");
                    }

                    $matiere = Matiere::where('code', $record['matiere_code'])->first();
                    if (!$matiere) {
                        throw new \Exception("Matière '{$record['matiere_code']}' introuvable.");
                    }

                    $noteFloat = (float) $record['note'];
                    $noteMaxFloat = isset($record['note_max']) ? (float) $record['note_max'] : 20.0;
                    if ($noteFloat < 0 || $noteFloat > $noteMaxFloat) {
                        throw new \Exception("Note invalide ({$noteFloat}) selon le barème ({$noteMaxFloat}).");
                    }

                    $existingNote = Note::where('user_id', $user->id)
                        ->where('matiere_id', $matiere->id)
                        ->where('type_evaluation', $record['type_evaluation'])
                        ->where('date_evaluation', $record['date_evaluation'])
                        ->first();

                    if ($existingNote) {
                        throw new \Exception("Cette note a déjà été importée (Doublon).");
                    }

                    Note::create([
                        'user_id' => $user->id,
                        'matiere_id' => $matiere->id,
                        'note' => $noteFloat,
                        'note_max' => $noteMaxFloat,
                        'type_evaluation' => $record['type_evaluation'],
                        'coefficient' => isset($record['coefficient']) ? (int) $record['coefficient'] : 1,
                        'date_evaluation' => $record['date_evaluation'],
                        'semestre' => $record['semestre'],
                        'annee_academique' => $record['annee_academique'],
                        'import_id' => $log->id,
                        'created_by_admin_id' => $admin->id,
                    ]);
                    $valides++;
                } catch (\Exception $e) {
                    $erreurs[] = ['ligne' => $index + 2, 'raison' => $e->getMessage()];
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $log->update(['statut' => 'echoue', 'completed_at' => now(), 'erreurs_details' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur critique lors de l\'import.', 'error' => $e->getMessage()], 500);
        }

        $log->update([
            'total_lignes' => $valides + count($erreurs),
            'lignes_valides' => $valides,
            'lignes_erreur' => count($erreurs),
            'erreurs_details' => empty($erreurs) ? null : $erreurs,
            'statut' => 'termine',
            'completed_at' => now(),
        ]);

        return response()->json([
            'import_id' => $log->id,
            'total' => $valides + count($erreurs),
            'valides' => $valides,
            'erreurs' => count($erreurs),
            'erreurs_details' => $erreurs
        ]);
    }

    public function importEmploiTemps(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:5120']);

        $admin = $request->user();

        $log = ImportLog::create([
            'admin_id' => $admin->id,
            'type_import' => 'emploi_temps',
            'fichier_nom' => $request->file('file')->getClientOriginalName(),
            'total_lignes' => 0,
            'lignes_valides' => 0,
            'lignes_erreur' => 0,
            'statut' => 'en_cours',
        ]);

        $csv = Reader::createFromPath($request->file('file')->getRealPath());
        $csv->setHeaderOffset(0);
        $records = $csv->getRecords();

        $erreurs = [];
        $valides = 0;

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();

        DB::beginTransaction();
        try {
            foreach ($records as $index => $record) {
                try {
                    $filiere = Filiere::where('code', $record['filiere_code'])->first();
                    if (!$filiere) {
                        throw new \Exception("Filière '{$record['filiere_code']}' introuvable.");
                    }

                    if ($isChef && $filiere->departement_id !== $admin->departement_id) {
                        throw new \Exception("La filière '{$record['filiere_code']}' n'appartient pas à votre département.");
                    }

                    $matiere = Matiere::where('code', $record['matiere_code'])->first();
                    if (!$matiere) {
                        throw new \Exception("Matière '{$record['matiere_code']}' introuvable.");
                    }

                    $matiereLiee = DB::table('filiere_matieres')
                        ->where('filiere_id', $filiere->id)
                        ->where('matiere_id', $matiere->id)
                        ->exists();

                    if (!$matiereLiee) {
                        // On l'ajoute automatiquement si elle n'y est pas
                        $filiere->matieres()->attach($matiere->id, ['semestre' => $record['semestre']]);
                    }

                    if (!in_array($record['jour'], ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'])) {
                        throw new \Exception("Jour '{$record['jour']}' invalide.");
                    }

                    if (!empty($record['salle'])) {
                        $conflit = \App\Models\EmploiTempsFiliere::where('jour', $record['jour'])
                            ->where('salle', $record['salle'])
                            ->where('semestre', $record['semestre'])
                            ->where('heure_debut', '<', $record['heure_fin'])
                            ->where('heure_fin', '>', $record['heure_debut'])
                            ->exists();

                        if ($conflit) {
                            throw new \Exception("Conflit de salle ({$record['salle']} à {$record['heure_debut']}).");
                        }
                    }

                    \App\Models\EmploiTempsFiliere::create([
                        'filiere_id' => $filiere->id,
                        'matiere_id' => $matiere->id,
                        'jour' => $record['jour'],
                        'heure_debut' => $record['heure_debut'],
                        'heure_fin' => $record['heure_fin'],
                        'salle' => $record['salle'] ?? null,
                        'type_cours' => $record['type_cours'] ?? 'CM',
                        'enseignant' => $record['enseignant'] ?? null,
                        'semestre' => $record['semestre'],
                    ]);
                    $valides++;
                } catch (\Exception $e) {
                    $erreurs[] = ['ligne' => $index + 2, 'raison' => $e->getMessage()];
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $log->update(['statut' => 'echoue', 'completed_at' => now(), 'erreurs_details' => $e->getMessage()]);
            return response()->json(['message' => 'Erreur critique lors de l\'import.', 'error' => $e->getMessage()], 500);
        }

        $log->update([
            'total_lignes' => $valides + count($erreurs),
            'lignes_valides' => $valides,
            'lignes_erreur' => count($erreurs),
            'erreurs_details' => empty($erreurs) ? null : $erreurs,
            'statut' => 'termine',
            'completed_at' => now(),
        ]);

        return response()->json([
            'import_id' => $log->id,
            'total' => $valides + count($erreurs),
            'valides' => $valides,
            'erreurs' => count($erreurs),
            'erreurs_details' => $erreurs
        ]);
    }

    public function history(Request $request)
    {
        $admin = $request->user();
        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();

        $imports = ImportLog::with('admin:id,nom,prenom')
            ->when($isChef, function ($query) use ($admin) {
                $query->where('admin_id', $admin->id);
            })
            ->latest()
            ->paginate(15);

        return response()->json($imports);
    }

    public function show(Request $request, $id)
    {
        $import = ImportLog::with('admin:id,nom,prenom')->findOrFail($id);
        $admin = $request->user();

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $import->admin_id !== $admin->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }


        return response()->json($import);
    }

    public function templateEtudiants()
    {
        $csv = Writer::createFromString();
        $csv->insertOne(['matricule', 'nom', 'prenom', 'filiere_code', 'annee_admission']);
        $csv->insertOne(['ETU001', 'DUPONT', 'Jean', 'L1-INFO-2026', '2025']);

        return response($csv->toString(), 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_etudiants.csv"',
        ]);
    }

    public function templateNotes()
    {
        $csv = Writer::createFromString();
        $csv->insertOne(['matricule', 'nom', 'prenom', 'filiere_code', 'matiere_code', 'note', 'note_max', 'type_evaluation', 'coefficient', 'date_evaluation', 'semestre', 'annee_academique']);
        $csv->insertOne(['ETU002', 'SMITH', 'Alice', 'L1-INFO-2026', 'ALGO101', '14.5', '20', 'Devoir', '2', '2025-11-15', 'S1', '2025-2026']);

        return response($csv->toString(), 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_notes.csv"',
        ]);
    }
    public function templateEmploiTemps()
    {
        $csv = Writer::createFromString();
        $csv->insertOne(['filiere_code', 'matiere_code', 'jour', 'heure_debut', 'heure_fin', 'salle', 'type_cours', 'enseignant', 'semestre']);
        $csv->insertOne(['L1-INFO-2026', 'ALGO101', 'Lundi', '08:00', '10:00', 'Amphi A', 'CM', 'Dr. MARTIN', 'S1']);
        $csv->insertOne(['L1-INFO-2026', 'ALGO101', 'Lundi', '10:15', '12:15', 'Salle 102', 'TD', 'M. BERNARD', 'S1']);

        return response($csv->toString(), 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="template_emploi_temps.csv"',
        ]);
    }
}

