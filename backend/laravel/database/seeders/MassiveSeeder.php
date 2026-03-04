<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Admin;
use App\Models\Departement;
use App\Models\ChefDepartement;
use App\Models\Filiere;
use App\Models\Matiere;
use App\Models\User;
use App\Models\Note;
use App\Models\Tache;
use App\Models\Alerte;
use App\Models\StatistiqueDepartement;
use App\Models\StatistiqueFiliere;

class MassiveSeeder extends Seeder
{
    private string $annee = '2025-2026';
    private string $pwd;
    private int $adminId;

    // ─── Catalogue matières par département ──────────────────────────────────
    private array $matieresCatalogue = [
        'INFO' => [
            ['nom' => 'Algorithmique', 'code' => 'ALGO101', 'coeff' => 3, 'prof' => 'Dr. AKANDE'],
            ['nom' => 'Base de Données', 'code' => 'BDD201', 'coeff' => 2, 'prof' => 'Pr. KOUTON'],
            ['nom' => 'Programmation Web', 'code' => 'WEB201', 'coeff' => 2, 'prof' => 'M. FOLARIN'],
            ['nom' => 'Réseaux', 'code' => 'RX301', 'coeff' => 2, 'prof' => 'Dr. BIAOU'],
            ['nom' => 'Mathématiques', 'code' => 'MATH101', 'coeff' => 2, 'prof' => 'M. ADJOVI'],
            ['nom' => 'Systèmes d\'exploitation', 'code' => 'SYS201', 'coeff' => 2, 'prof' => 'Dr. KPANOU'],
            ['nom' => 'Programmation C', 'code' => 'PROG101', 'coeff' => 3, 'prof' => 'M. SOGLO'],
            ['nom' => 'Intelligence Artificielle', 'code' => 'IA401', 'coeff' => 3, 'prof' => 'Dr. DOSSOU'],
        ],
        'GC' => [
            ['nom' => 'Résistance des Matériaux', 'code' => 'RDM201', 'coeff' => 3, 'prof' => 'Pr. HOUNGAN'],
            ['nom' => 'Béton Armé', 'code' => 'BA301', 'coeff' => 3, 'prof' => 'Dr. AMOUSSOU'],
            ['nom' => 'Mécanique des Sols', 'code' => 'MDS201', 'coeff' => 2, 'prof' => 'M. TONATO'],
            ['nom' => 'Topographie', 'code' => 'TOPO101', 'coeff' => 2, 'prof' => 'Mme ADJAKOU'],
            ['nom' => 'Hydraulique', 'code' => 'HYD301', 'coeff' => 2, 'prof' => 'Dr. GBAGUIDI'],
            ['nom' => 'Dessin Technique', 'code' => 'DT101', 'coeff' => 1, 'prof' => 'M. SOSSOU'],
        ],
        'ELEC' => [
            ['nom' => 'Électronique Analogique', 'code' => 'EA201', 'coeff' => 3, 'prof' => 'Pr. AGBOSSOU'],
            ['nom' => 'Électronique Numérique', 'code' => 'EN301', 'coeff' => 3, 'prof' => 'Dr. ZANNOU'],
            ['nom' => 'Automatique', 'code' => 'AUTO201', 'coeff' => 2, 'prof' => 'M. HOUNSA'],
            ['nom' => 'Électrotechnique', 'code' => 'ELTECH301', 'coeff' => 2, 'prof' => 'Pr. DAGA'],
            ['nom' => 'Traitement du Signal', 'code' => 'TS201', 'coeff' => 2, 'prof' => 'Dr. OKOU'],
            ['nom' => 'Physique Appliquée', 'code' => 'PHYA101', 'coeff' => 2, 'prof' => 'M. DJOSSOU'],
        ],
        'MATH' => [
            ['nom' => 'Analyse Mathématique', 'code' => 'ANA201', 'coeff' => 3, 'prof' => 'Pr. MENSAH'],
            ['nom' => 'Algèbre Linéaire', 'code' => 'ALG101', 'coeff' => 3, 'prof' => 'Dr. BOHOUN'],
            ['nom' => 'Probabilités et Statistiques', 'code' => 'PROBA201', 'coeff' => 2, 'prof' => 'M. AGOSSA'],
            ['nom' => 'Optimisation', 'code' => 'OPTIM301', 'coeff' => 2, 'prof' => 'Dr. AFFO'],
            ['nom' => 'Analyse Numérique', 'code' => 'ANUM201', 'coeff' => 2, 'prof' => 'Pr. SAVI'],
        ],
        'ECO' => [
            ['nom' => 'Microéconomie', 'code' => 'MICRO101', 'coeff' => 3, 'prof' => 'Pr. KIKI'],
            ['nom' => 'Macroéconomie', 'code' => 'MACRO201', 'coeff' => 3, 'prof' => 'Dr. HOUENON'],
            ['nom' => 'Comptabilité Générale', 'code' => 'COMPTA101', 'coeff' => 2, 'prof' => 'M. AHOUANNOU'],
            ['nom' => 'Statistiques Appliquées', 'code' => 'STAPP201', 'coeff' => 2, 'prof' => 'Mme BOKO'],
            ['nom' => 'Droit des Affaires', 'code' => 'DROIT201', 'coeff' => 2, 'prof' => 'M. GNACADJA'],
        ],
    ];

    // ─── Prénoms / Noms africains réalistes ──────────────────────────────────
    private array $prenoms = [
        'Octave',
        'Marc',
        'Amine',
        'Alice',
        'Sophie',
        'Ibrahim',
        'Fatima',
        'Jean',
        'Pierre',
        'Marie',
        'Kossi',
        'Bénédicte',
        'Yao',
        'Rachid',
        'Amina',
        'Koffi',
        'Nadège',
        'Félicien',
        'Grâce',
        'David',
        'Estelle',
        'Rodrigue',
        'Claudine',
        'Émile',
        'Franck',
        'Habibou',
        'Inès',
        'Joël',
        'Karen',
        'Léon',
        'Marius',
        'Nathalie',
        'Olivier',
        'Pascale',
        'Quentin',
        'Rita',
        'Serge',
        'Tatiana',
        'Urbain',
        'Viviane',
        'Wilfried',
        'Xavier',
        'Yves',
        'Zénab',
        'Aristide',
        'Bérénice',
        'Cédric',
        'Diane',
        'Évariste',
        'Florence',
    ];

    private array $noms = [
        'BAHOUN',
        'KOFFI',
        'SALIHOU',
        'ZANNOU',
        'DOE',
        'AGBOSSOU',
        'TONATO',
        'DOSSOU',
        'GBAGUIDI',
        'HOUNGAN',
        'ADJOVI',
        'SOGLO',
        'BIAOU',
        'AMOUSSOU',
        'ADJAKOU',
        'SOSSOU',
        'MENSAH',
        'BOHOUN',
        'AGOSSA',
        'AFFO',
        'KPANOU',
        'FOLARIN',
        'KOUTON',
        'HOUENON',
        'AHOUANNOU',
        'BOKO',
        'GNACADJA',
        'OKOU',
        'DJOSSOU',
        'DAGA',
        'ZINFLOU',
        'TOSSOU',
        'HOUSSOU',
        'AZONKPIN',
        'ASSOGBA',
        'DEGBEY',
        'GANGBO',
        'HOUNKPE',
        'KASSA',
        'LAWANI',
        'MEHOU',
        'NOUKPO',
        'OUASSA',
        'PADONOU',
        'QUENUM',
        'SAGBO',
        'TOKPO',
        'VODOUHE',
        'WABI',
        'YEHOUENOU',
    ];

    // ══════════════════════════════════════════════════════════════════════════
    // ─── POINT D'ENTRÉE ──────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    public function run(): void
    {
        $this->pwd = Hash::make('password');

        $this->command->info('');
        $this->command->info('╔══════════════════════════════════════════════════════╗');
        $this->command->info('║       🚀 MASSIVE SEED — AcademiX Production Data    ║');
        $this->command->info('╚══════════════════════════════════════════════════════╝');
        $this->command->info('');

        $this->seedAdmins();
        $this->seedDepartements();
        $this->seedChefs();
        $this->seedMatieres();
        $this->seedFilieres();
        $this->seedFiliereMatieres();
        $this->seedEtudiants();
        $this->seedNotes();
        $this->seedTaches();
        $this->seedAlertes();
        $this->seedStatistiques();

        $this->command->info('');
        $this->command->info('╔══════════════════════════════════════════════════════╗');
        $this->command->info('║  ✅ SEED MASSIF TERMINÉ AVEC SUCCÈS                 ║');
        $this->command->info('╠══════════════════════════════════════════════════════╣');
        $this->command->info('║  Comptes de connexion (password = "password") :     ║');
        $this->command->info('║                                                      ║');
        $this->command->info('║  👑 Admin     : admin@academix.com                   ║');
        $this->command->info('║  🏛️  Chef INFO : chef.info@academix.com              ║');
        $this->command->info('║  🏛️  Chef GC   : chef.gc@academix.com                ║');
        $this->command->info('║  🏛️  Chef ELEC : chef.elec@academix.com              ║');
        $this->command->info('║  🏛️  Chef MATH : chef.math@academix.com              ║');
        $this->command->info('║  🏛️  Chef ECO  : chef.eco@academix.com               ║');
        $this->command->info('║                                                      ║');
        $this->command->info('║  🎓 Étudiants : ETU-INFO-001@academix.com            ║');
        $this->command->info('║                 ETU-GC-001@academix.com  etc.        ║');
        $this->command->info('╚══════════════════════════════════════════════════════╝');
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── 1. ADMINS ───────────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    private function seedAdmins(): void
    {
        $admin = Admin::updateOrCreate(
            ['email' => 'admin@academix.com'],
            [
                'nom' => 'ADMIN',
                'prenom' => 'Super',
                'password' => $this->pwd,
                'is_active' => true,
            ]
        );
        $this->adminId = $admin->id;

        Admin::updateOrCreate(
            ['email' => 'hana@academix.com'],
            [
                'nom' => 'BIAOU',
                'prenom' => 'Hana',
                'password' => $this->pwd,
                'is_active' => true,
            ]
        );

        $this->command->info('  ✓ 2 admins créés');
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── 2. DÉPARTEMENTS ─────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    private function seedDepartements(): void
    {
        $depts = [
            ['nom' => 'Informatique', 'code' => 'INFO', 'description' => 'Département d\'Informatique et Sciences du Numérique'],
            ['nom' => 'Génie Civil', 'code' => 'GC', 'description' => 'Département de Génie Civil et Construction'],
            ['nom' => 'Génie Électrique', 'code' => 'ELEC', 'description' => 'Département de Génie Électrique et Automatisme'],
            ['nom' => 'Mathématiques', 'code' => 'MATH', 'description' => 'Département de Mathématiques Fondamentales et Appliquées'],
            ['nom' => 'Sciences Économiques', 'code' => 'ECO', 'description' => 'Département de Sciences Économiques et Gestion'],
        ];

        foreach ($depts as $d) {
            $code = $d['code'];
            unset($d['code']);
            $d['created_by'] = $this->adminId;
            Departement::updateOrCreate(['code' => $code], $d);
        }

        $this->command->info('  ✓ ' . count($depts) . ' départements créés');
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── 3. CHEFS DE DÉPARTEMENT ─────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    private function seedChefs(): void
    {
        $chefs = [
            ['nom' => 'FOLARIN', 'prenom' => 'Mourchid', 'email' => 'chef.info@academix.com', 'dept' => 'INFO'],
            ['nom' => 'KOUTON', 'prenom' => 'Jean', 'email' => 'chef.gc@academix.com', 'dept' => 'GC'],
            ['nom' => 'AGBOSSOU', 'prenom' => 'Paul', 'email' => 'chef.elec@academix.com', 'dept' => 'ELEC'],
            ['nom' => 'MENSAH', 'prenom' => 'Richard', 'email' => 'chef.math@academix.com', 'dept' => 'MATH'],
            ['nom' => 'KIKI', 'prenom' => 'Emmanuel', 'email' => 'chef.eco@academix.com', 'dept' => 'ECO'],
        ];

        foreach ($chefs as $c) {
            $deptId = Departement::where('code', $c['dept'])->value('id');
            ChefDepartement::updateOrCreate(
                ['email' => $c['email']],
                [
                    'nom' => $c['nom'],
                    'prenom' => $c['prenom'],
                    'password' => $this->pwd,
                    'departement_id' => $deptId,
                    'created_by_admin' => $this->adminId,
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('  ✓ ' . count($chefs) . ' chefs de département créés');
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── 4. MATIÈRES ─────────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    private function seedMatieres(): void
    {
        $count = 0;
        foreach ($this->matieresCatalogue as $matieres) {
            foreach ($matieres as $m) {
                Matiere::updateOrCreate(
                    ['code' => $m['code']],
                    [
                        'nom' => $m['nom'],
                        'coefficient' => $m['coeff'],
                        'enseignant' => $m['prof'] ?? null,
                    ]
                );
                $count++;
            }
        }
        $this->command->info("  ✓ {$count} matières créées");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── 5. FILIÈRES ─────────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    private function seedFilieres(): void
    {
        $niveaux = ['L1', 'L2', 'L3'];
        $depts = Departement::all();
        $count = 0;

        foreach ($depts as $dept) {
            foreach ($niveaux as $niv) {
                Filiere::updateOrCreate(
                    ['code' => "{$niv}-{$dept->code}-2026"],
                    [
                        'departement_id' => $dept->id,
                        'nom' => $dept->nom,
                        'niveau' => $niv,
                        'annee_academique' => $this->annee,
                    ]
                );
                $count++;
            }
        }

        $this->command->info("  ✓ {$count} filières créées (L1-L3 × 5 départements)");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── 6. PIVOT FILIÈRE ↔ MATIÈRES ─────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    private function seedFiliereMatieres(): void
    {
        $filieres = Filiere::all();
        $count = 0;

        foreach ($filieres as $fil) {
            $dept = Departement::find($fil->departement_id);
            $matsCatalogue = $this->matieresCatalogue[$dept->code] ?? [];

            foreach ($matsCatalogue as $idx => $mc) {
                $matId = Matiere::where('code', $mc['code'])->value('id');
                if (!$matId)
                    continue;

                // Répartir les matières entre S1 et S2
                $semestre = $idx < ceil(count($matsCatalogue) / 2) ? 'S1' : 'S2';

                DB::table('filiere_matieres')->insertOrIgnore([
                    'filiere_id' => $fil->id,
                    'matiere_id' => $matId,
                    'semestre' => $semestre,
                ]);
                $count++;
            }
        }

        $this->command->info("  ✓ {$count} associations filière↔matière créées");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── 7. ÉTUDIANTS (avec profils de niveau variés) ────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    private function seedEtudiants(): void
    {
        $filieres = Filiere::with('departement')->get();
        $totalStudents = 0;

        foreach ($filieres as $fil) {
            $deptCode = $fil->departement->code;
            // 8 étudiants par filière = 8 × 15 filières = 120 étudiants
            for ($i = 1; $i <= 8; $i++) {
                $num = str_pad($totalStudents + 1, 3, '0', STR_PAD_LEFT);
                $matricule = "ETU-{$deptCode}-{$num}";
                $prenom = $this->prenoms[array_rand($this->prenoms)];
                $nom = $this->noms[array_rand($this->noms)];

                User::updateOrCreate(
                    ['matricule' => $matricule],
                    [
                        'nom' => $nom,
                        'prenom' => $prenom,
                        'email' => strtolower($matricule) . '@academix.com',
                        'password' => $this->pwd,
                        'telephone' => '+229 97 ' . rand(10, 99) . ' ' . rand(10, 99) . ' ' . rand(10, 99),
                        'filiere_id' => $fil->id,
                        'annee_admission' => '2025',
                        'objectif_moyenne' => rand(10, 16),
                        'style_apprentissage' => ['visuel', 'auditif', 'kinesthesique'][array_rand(['visuel', 'auditif', 'kinesthesique'])],
                        'is_active' => true,
                    ]
                );
                $totalStudents++;
            }
        }

        $this->command->info("  ✓ {$totalStudents} étudiants créés (8 par filière)");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── 9. NOTES (profils variés : excellent / bon / moyen / faible / très faible)
    // ══════════════════════════════════════════════════════════════════════════

    private function seedNotes(): void
    {
        $typesEval = ['Devoir', 'Partiel', 'TP', 'Projet', 'Examen'];
        $count = 0;

        // Les 8 étudiants d'une filière auront ces profils :
        // [0] excellent, [1] excellent, [2] bon, [3] bon, [4] moyen, [5] faible, [6] très faible, [7] très faible
        $profils = [
            'excellent' => [14.0, 19.5],   // notes entre 14 et 19.5
            'bon' => [11.0, 15.0],   // notes entre 11 et 15
            'moyen' => [8.0, 12.5],    // notes entre 8 et 12.5
            'faible' => [5.0, 9.5],     // notes entre 5 et 9.5
            'tres_faible' => [1.0, 6.0],     // notes entre 1 et 6
        ];

        $profilOrder = [
            'excellent',
            'excellent',
            'bon',
            'bon',
            'moyen',
            'faible',
            'tres_faible',
            'tres_faible'
        ];

        $datesSemS1 = ['2025-10-10', '2025-11-05', '2025-11-25', '2025-12-15', '2026-01-15'];
        $datesSemS2 = ['2026-02-10', '2026-02-28', '2026-03-15', '2026-04-10', '2026-05-20'];

        $filieres = Filiere::with('departement')->get();

        $bulkNotes = [];
        $now = now();

        foreach ($filieres as $fil) {
            $dept = $fil->departement;
            $matsCatalogue = $this->matieresCatalogue[$dept->code] ?? [];

            // Étudiants de cette filière, ordonnés par id
            $students = User::where('filiere_id', $fil->id)->orderBy('id')->get();

            foreach ($students as $sIdx => $student) {
                $profil = $profilOrder[$sIdx % count($profilOrder)];
                [$minNote, $maxNote] = $profils[$profil];

                foreach ($matsCatalogue as $mIdx => $mc) {
                    $matId = Matiere::where('code', $mc['code'])->value('id');
                    if (!$matId)
                        continue;

                    $sem = $mIdx < ceil(count($matsCatalogue) / 2) ? 'S1' : 'S2';
                    $dates = $sem === 'S1' ? $datesSemS1 : $datesSemS2;

                    // 3 notes par matière par étudiant (Devoir, Partiel/TP, Examen)
                    $evalTypes = ['Devoir', $typesEval[array_rand([1, 2, 3])], 'Examen'];
                    $coeffs = [1, 1, 2];

                    for ($n = 0; $n < 3; $n++) {
                        // Légère variation aléatoire dans la plage du profil
                        $note = round($minNote + (mt_rand() / mt_getrandmax()) * ($maxNote - $minNote), 2);
                        $note = max(0, min(20, $note));

                        $bulkNotes[] = [
                            'user_id' => $student->id,
                            'matiere_id' => $matId,
                            'note' => $note,
                            'note_max' => 20,
                            'type_evaluation' => $evalTypes[$n],
                            'coefficient' => $coeffs[$n],
                            'date_evaluation' => $dates[$n % count($dates)],
                            'semestre' => $sem,
                            'annee_academique' => $this->annee,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                        $count++;
                    }
                }
            }
        }

        // Insertion par chunks de 500 pour performance
        foreach (array_chunk($bulkNotes, 500) as $chunk) {
            DB::table('notes')->insert($chunk);
        }

        $this->command->info("  ✓ {$count} notes insérées (profils : excellent → très faible)");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── 10. TÂCHES ──────────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    private function seedTaches(): void
    {
        $tachesModeles = [
            ['titre' => 'Terminer le TP de %s', 'prio' => 'haute', 'statut' => 'en_cours'],
            ['titre' => 'Préparer l\'exposé sur %s', 'prio' => 'moyenne', 'statut' => 'a_faire'],
            ['titre' => 'Rendre le devoir de %s', 'prio' => 'haute', 'statut' => 'terminee'],
            ['titre' => 'Lire les notes de cours de %s', 'prio' => 'basse', 'statut' => 'a_faire'],
            ['titre' => 'Préparer l\'examen de %s', 'prio' => 'haute', 'statut' => 'a_faire'],
        ];

        $count = 0;
        $filieres = Filiere::with('departement')->get();

        foreach ($filieres as $fil) {
            $dept = $fil->departement;
            $matsCatalogue = $this->matieresCatalogue[$dept->code] ?? [];
            $students = User::where('filiere_id', $fil->id)->orderBy('id')->get();

            foreach ($students as $student) {
                // 3-5 tâches par étudiant
                $nbTaches = rand(3, 5);
                for ($t = 0; $t < $nbTaches; $t++) {
                    $tacheModel = $tachesModeles[array_rand($tachesModeles)];
                    $matiere = $matsCatalogue[array_rand($matsCatalogue)];
                    $matId = Matiere::where('code', $matiere['code'])->value('id');

                    Tache::create([
                        'user_id' => $student->id,
                        'titre' => sprintf($tacheModel['titre'], $matiere['nom']),
                        'description' => "Tâche automatiquement générée pour {$matiere['nom']}.",
                        'matiere_id' => $matId,
                        'date_limite' => now()->addDays(rand(-5, 30)),
                        'priorite' => $tacheModel['prio'],
                        'statut' => $tacheModel['statut'],
                    ]);
                    $count++;
                }
            }
        }

        $this->command->info("  ✓ {$count} tâches créées (3-5 par étudiant)");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── 11. ALERTES ─────────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    private function seedAlertes(): void
    {
        $count = 0;

        // Alertes pour les étudiants faibles / très faibles
        $students = User::all();
        foreach ($students as $student) {
            $notes = Note::where('user_id', $student->id)->get();
            if ($notes->isEmpty())
                continue;

            $avg = $notes->avg('note');

            if ($avg < 8) {
                Alerte::create([
                    'user_id' => $student->id,
                    'type_alerte' => 'moyenne_faible',
                    'niveau_severite' => 'eleve',
                    'titre' => 'Moyenne générale critique',
                    'message' => "Votre moyenne générale est de " . round($avg, 2) . "/20. Il est urgent de consulter vos enseignants et de redoubler d'efforts.",
                    'actions_suggerees' => ['Consulter un tuteur pédagogique', 'Revoir les matières faibles en priorité', 'Participer aux séances de tutorat'],
                    'est_lue' => false,
                ]);
                $count++;
            } elseif ($avg < 10) {
                Alerte::create([
                    'user_id' => $student->id,
                    'type_alerte' => 'moyenne_faible',
                    'niveau_severite' => 'moyen',
                    'titre' => 'Moyenne en dessous du seuil',
                    'message' => "Votre moyenne est de " . round($avg, 2) . "/20. Des efforts supplémentaires sont nécessaires pour valider le semestre.",
                    'actions_suggerees' => ['Organiser des séances de révision', 'Identifier les matières à améliorer'],
                    'est_lue' => false,
                ]);
                $count++;
            }
        }

        $this->command->info("  ✓ {$count} alertes créées (étudiants en difficulté)");
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ─── 12. STATISTIQUES ────────────────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════════════

    private function seedStatistiques(): void
    {
        $depts = Departement::all();

        foreach ($depts as $dept) {
            $filiereIds = Filiere::where('departement_id', $dept->id)->pluck('id');
            $totalEtudiants = User::whereIn('filiere_id', $filiereIds)->count();
            $totalFilieres = $filiereIds->count();

            $notes = Note::whereIn('user_id', function ($q) use ($filiereIds) {
                $q->select('id')->from('users')->whereIn('filiere_id', $filiereIds);
            })->get();

            $moyDept = $notes->avg('note') ?? 0;
            $tauxReussite = $notes->count() > 0
                ? round(($notes->where('note', '>=', 10)->count() / $notes->count()) * 100, 2)
                : 0;

            StatistiqueDepartement::create([
                'departement_id' => $dept->id,
                'annee_academique' => $this->annee,
                'total_etudiants' => $totalEtudiants,
                'total_filieres' => $totalFilieres,
                'moyenne_generale' => round($moyDept, 2),
                'taux_reussite' => $tauxReussite,
            ]);

            // Statistiques par filière
            foreach ($filiereIds as $filId) {
                foreach (['S1', 'S2'] as $sem) {
                    $filNotes = Note::whereIn('user_id', function ($q) use ($filId) {
                        $q->select('id')->from('users')->where('filiere_id', $filId);
                    })->where('semestre', $sem)->get();

                    if ($filNotes->isEmpty())
                        continue;

                    $moyFil = round($filNotes->avg('note'), 2);
                    $tauxFil = round(($filNotes->where('note', '>=', 10)->count() / $filNotes->count()) * 100, 2);

                    // Meilleure / pire matière
                    $parMatiere = $filNotes->groupBy('matiere_id');
                    $best = null;
                    $worst = null;
                    $bestAvg = 0;
                    $worstAvg = 20;
                    foreach ($parMatiere as $matId => $group) {
                        $avg = $group->avg('note');
                        if ($avg > $bestAvg) {
                            $bestAvg = $avg;
                            $best = $matId;
                        }
                        if ($avg < $worstAvg) {
                            $worstAvg = $avg;
                            $worst = $matId;
                        }
                    }

                    StatistiqueFiliere::create([
                        'filiere_id' => $filId,
                        'annee_academique' => $this->annee,
                        'semestre' => $sem,
                        'total_etudiants' => User::where('filiere_id', $filId)->count(),
                        'moyenne_generale' => $moyFil,
                        'taux_reussite' => $tauxFil,
                        'meilleure_matiere' => $best ? Matiere::find($best)?->nom : null,
                        'matiere_difficile' => $worst ? Matiere::find($worst)?->nom : null,
                    ]);
                }
            }
        }

        $this->command->info('  ✓ Statistiques départements + filières calculées');
    }
}
