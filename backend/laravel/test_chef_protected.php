<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\ChefDepartement;
use Illuminate\Http\Request;
use Laravel\Sanctum\Sanctum;

$chef = ChefDepartement::first();
Sanctum::actingAs($chef);

$request = Request::create('/api/v1/departement/dashboard', 'GET');
$request->headers->set('Accept', 'application/json');

$response = $app->handle($request);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
