<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            DepartementSeeder::class,
            ChefDepartementSeeder::class,
            FiliereSeeder::class,
            MatiereSeeder::class,
        ]);
    }
}
