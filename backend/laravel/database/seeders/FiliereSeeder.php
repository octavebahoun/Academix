<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Filiere;

class FiliereSeeder extends Seeder
{
    public function run(): void
    {
        $filieres = [
            // Département Informatique
            ['departement_id' => 1, 'nom' => 'Informatique', 'niveau' => 'L1', 'code' => 'L1-INFO-2026', 'annee_academique' => '2025-2026'],
            ['departement_id' => 1, 'nom' => 'Informatique', 'niveau' => 'L2', 'code' => 'L2-INFO-2026', 'annee_academique' => '2025-2026'],
            ['departement_id' => 1, 'nom' => 'Informatique', 'niveau' => 'L3', 'code' => 'L3-INFO-2026', 'annee_academique' => '2025-2026'],
            ['departement_id' => 1, 'nom' => 'Réseaux', 'niveau' => 'M1', 'code' => 'M1-RX-2026', 'annee_academique' => '2025-2026'],
            
            // Département Génie Civil
            ['departement_id' => 2, 'nom' => 'Génie Civil', 'niveau' => 'L1', 'code' => 'L1-GC-2026', 'annee_academique' => '2025-2026'],
            ['departement_id' => 2, 'nom' => 'Génie Civil', 'niveau' => 'L2', 'code' => 'L2-GC-2026', 'annee_academique' => '2025-2026'],
        ];

        foreach ($filieres as $filiere) {
            Filiere::create($filiere);
        }
    }
}
