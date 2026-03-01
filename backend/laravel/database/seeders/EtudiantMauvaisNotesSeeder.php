<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class EtudiantMauvaisNotesSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer la filière L1 Informatique
        $filiere = DB::table('filieres')->where('code', 'L1-INFO-2026')->first();

        if (!$filiere) {
            $this->command->error('Filière L1-INFO-2026 introuvable. Lancez d\'abord FiliereSeeder.');
            return;
        }

        // Créer ou mettre à jour l'étudiant
        $etudiant = User::updateOrCreate(
            ['matricule' => 'ETU-TEST-BAD'],
            [
                'nom' => 'FAILING',
                'prenom' => 'Étudiant',
                'email' => 'etudiant.test@academix.bj',
                'password' => Hash::make('password'),
                'telephone' => '+229 97 00 00 01',
                'filiere_id' => $filiere->id,
                'annee_admission' => '2025',
                'objectif_moyenne' => 12.00,
                'style_apprentissage' => 'visuel',
                'is_active' => true,
            ]
        );

        $this->command->info("Étudiant créé : matricule=ETU-TEST-BAD | email=etudiant.test@academix.bj | password=password");

        // Récupérer les matières info
        $matieres = DB::table('matieres')
            ->whereIn('code', ['ALGO101', 'BDD201', 'RX301', 'WEB201', 'MATH101'])
            ->get()
            ->keyBy('code');

        if ($matieres->isEmpty()) {
            $this->command->error('Matières introuvables. Lancez d\'abord MatiereSeeder.');
            return;
        }

        // Supprimer les anciennes notes de cet étudiant (reset propre)
        DB::table('notes')->where('user_id', $etudiant->id)->delete();

        $annee = '2025-2026';

        $notes = [];

        // --- ALGORITHMIQUE ---
        if ($m = $matieres->get('ALGO101')) {
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 3.50, 'note_max' => 20, 'type_evaluation' => 'Devoir', 'coefficient' => 1, 'date_evaluation' => '2025-10-10', 'semestre' => 'S1', 'annee_academique' => $annee];
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 4.00, 'note_max' => 20, 'type_evaluation' => 'Partiel', 'coefficient' => 2, 'date_evaluation' => '2025-11-20', 'semestre' => 'S1', 'annee_academique' => $annee];
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 5.50, 'note_max' => 20, 'type_evaluation' => 'Examen', 'coefficient' => 3, 'date_evaluation' => '2026-01-15', 'semestre' => 'S1', 'annee_academique' => $annee];
        }

        // --- BASE DE DONNÉES ---
        if ($m = $matieres->get('BDD201')) {
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 6.00, 'note_max' => 20, 'type_evaluation' => 'Devoir', 'coefficient' => 1, 'date_evaluation' => '2025-10-15', 'semestre' => 'S1', 'annee_academique' => $annee];
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 7.50, 'note_max' => 20, 'type_evaluation' => 'TP', 'coefficient' => 1, 'date_evaluation' => '2025-11-05', 'semestre' => 'S1', 'annee_academique' => $annee];
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 4.00, 'note_max' => 20, 'type_evaluation' => 'Examen', 'coefficient' => 3, 'date_evaluation' => '2026-01-18', 'semestre' => 'S1', 'annee_academique' => $annee];
        }

        // --- MATHÉMATIQUES ---
        if ($m = $matieres->get('MATH101')) {
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 2.00, 'note_max' => 20, 'type_evaluation' => 'Devoir', 'coefficient' => 1, 'date_evaluation' => '2025-10-08', 'semestre' => 'S1', 'annee_academique' => $annee];
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 5.00, 'note_max' => 20, 'type_evaluation' => 'Partiel', 'coefficient' => 2, 'date_evaluation' => '2025-11-25', 'semestre' => 'S1', 'annee_academique' => $annee];
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 3.50, 'note_max' => 20, 'type_evaluation' => 'Examen', 'coefficient' => 3, 'date_evaluation' => '2026-01-20', 'semestre' => 'S1', 'annee_academique' => $annee];
        }

        // --- RÉSEAUX ---
        if ($m = $matieres->get('RX301')) {
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 5.00, 'note_max' => 20, 'type_evaluation' => 'Devoir', 'coefficient' => 1, 'date_evaluation' => '2026-02-10', 'semestre' => 'S2', 'annee_academique' => $annee];
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 8.00, 'note_max' => 20, 'type_evaluation' => 'Partiel', 'coefficient' => 2, 'date_evaluation' => '2026-02-28', 'semestre' => 'S2', 'annee_academique' => $annee];
        }

        // --- PROGRAMMATION WEB ---
        if ($m = $matieres->get('WEB201')) {
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 3.00, 'note_max' => 20, 'type_evaluation' => 'Projet', 'coefficient' => 2, 'date_evaluation' => '2026-02-15', 'semestre' => 'S2', 'annee_academique' => $annee];
            $notes[] = ['user_id' => $etudiant->id, 'matiere_id' => $m->id, 'note' => 6.50, 'note_max' => 20, 'type_evaluation' => 'Examen', 'coefficient' => 3, 'date_evaluation' => '2026-03-01', 'semestre' => 'S2', 'annee_academique' => $annee];
        }

        // Horodatage
        $now = now();
        foreach ($notes as &$n) {
            $n['created_at'] = $now;
            $n['updated_at'] = $now;
        }

        DB::table('notes')->insert($notes);

        $this->command->info(count($notes) . " notes insérées (toutes < 10/20).");
        $this->command->line('');
        $this->command->line('  ┌─────────────────────────────────────────┐');
        $this->command->line('  │  Connexion étudiant test                │');
        $this->command->line('  │  Email    : etudiant.test@academix.bj   │');
        $this->command->line('  │  Password : password                    │');
        $this->command->line('  └─────────────────────────────────────────┘');
    }
}
