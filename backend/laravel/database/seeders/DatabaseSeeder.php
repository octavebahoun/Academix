<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DepartementSeeder::class,
            AdminSeeder::class,
            FiliereSeeder::class,
            MatiereSeeder::class,
            // UserSeeder::class, // À créer pour tester
        ]);
    }
}
