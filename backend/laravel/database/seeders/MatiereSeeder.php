<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Matiere;

class MatiereSeeder extends Seeder
{
    public function run(): void
    {
        $matieres = [

            ['nom' => 'Algorithmique', 'code' => 'ALGO101', 'coefficient' => 3, 'enseignant' => 'Dr. AKANDE'],
            ['nom' => 'Base de Données', 'code' => 'BDD201', 'coefficient' => 2, 'enseignant' => 'Pr. KOUTON'],
            ['nom' => 'Réseaux', 'code' => 'RX301', 'coefficient' => 2, 'enseignant' => 'Dr. BIAOU'],
            ['nom' => 'Programmation Web', 'code' => 'WEB201', 'coefficient' => 2, 'enseignant' => 'M. FOLARIN'],
            ['nom' => 'Mathématiques', 'code' => 'MATH101', 'coefficient' => 2],

            ['nom' => 'Résistance des Matériaux', 'code' => 'RDM201', 'coefficient' => 3],
            ['nom' => 'Béton Armé', 'code' => 'BA301', 'coefficient' => 3],
        ];

        foreach ($matieres as $matiere) {
            Matiere::create($matiere);
        }
    }
}
