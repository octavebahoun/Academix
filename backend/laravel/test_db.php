<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Admin;
use App\Models\ChefDepartement;
use App\Models\User;

echo "--- ADMINS ---\n";
foreach (Admin::all() as $admin) {
    echo "ID: {$admin->id}, Email: {$admin->email}, Active: " . ($admin->is_active ? 'Yes' : 'No') . "\n";
}

echo "\n--- CHEFS ---\n";
foreach (ChefDepartement::all() as $chef) {
    echo "ID: {$chef->id}, Email: {$chef->email}, Active: " . ($chef->is_active ? 'Yes' : 'No') . ", Dept ID: {$chef->departement_id}\n";
}

echo "\n--- STUDENTS ---\n";
foreach (User::all() as $user) {
    echo "ID: {$user->id}, Matricule: {$user->matricule}, Email: {$user->email}, Active: " . ($user->is_active ? 'Yes' : 'No') . "\n";
}
