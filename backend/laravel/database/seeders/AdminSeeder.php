<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {

        Admin::create([
            'nom' => 'ADMIN',
            'prenom' => 'Super',
            'email' => 'admin@academix.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'departement_id' => null,
            'is_active' => true,
        ]);

        Admin::create([
            'nom' => 'FOLARIN',
            'prenom' => 'Mourchid',
            'email' => 'mourchid@academix.com',
            'password' => Hash::make('password'),
            'role' => 'chef_departement',
            'departement_id' => 1, 
            'is_active' => true,
        ]);

        Admin::create([
            'nom' => 'KOUTON',
            'prenom' => 'Jean',
            'email' => 'jean@academix.com',
            'password' => Hash::make('password'),
            'role' => 'chef_departement',
            'departement_id' => 2, 
            'is_active' => true,
        ]);
    }
}
