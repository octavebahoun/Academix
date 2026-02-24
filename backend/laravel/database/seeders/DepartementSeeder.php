<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Departement;

class DepartementSeeder extends Seeder
{
    public function run(): void
    {
        $departements = [
            ['nom' => 'Informatique', 'code' => 'INFO', 'description' => 'Département d\'Informatique'],
            ['nom' => 'Génie Civil', 'code' => 'GC', 'description' => 'Département de Génie Civil'],
            ['nom' => 'Mathématiques', 'code' => 'MATH', 'description' => 'Département de Mathématiques'],
            ['nom' => 'Physique', 'code' => 'PHY', 'description' => 'Département de Physique'],
        ];

        // Ensure at least one admin exists
        $admin = \App\Models\Admin::first();
        if (!$admin) {
            $admin = \App\Models\Admin::create([
                'nom' => 'System',
                'prenom' => 'Auto',
                'email' => 'system@auto.com',
                'password' => \Hash::make('password'),
            ]);
        }

        foreach ($departements as $dept) {
            $dept['created_by'] = $admin->id;
            Departement::create($dept);
        }
    }
}
