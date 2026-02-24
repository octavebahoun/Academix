<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ChefDepartement;
use App\Models\Admin;
use App\Models\Departement;
use Illuminate\Support\Facades\Hash;

class ChefDepartementSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Admin::first();
        if (!$admin)
            return;

        ChefDepartement::create([
            'nom' => 'FOLARIN',
            'prenom' => 'Mourchid',
            'email' => 'mourchid@academix.com',
            'password' => Hash::make('mourchid2026'),
            'departement_id' => Departement::where('code', 'INFO')->first()?->id ?? 1,
            'created_by_admin' => $admin->id,
            'is_active' => true,
        ]);

        ChefDepartement::create([
            'nom' => 'KOUTON',
            'prenom' => 'Jean',
            'email' => 'jean@academix.com',
            'password' => Hash::make('password'),
            'departement_id' => Departement::where('code', 'GC')->first()?->id ?? 2,
            'created_by_admin' => $admin->id,
            'is_active' => true,
        ]);
    }
}
