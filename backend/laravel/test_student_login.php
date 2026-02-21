<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Http\Request;

$request = Request::create('/api/v1/auth/student/login', 'POST', [
    'email' => 'mourchidolawale@gmail.com',
    'password' => 'password123'
]);
$request->headers->set('Accept', 'application/json');

$response = $app->handle($request);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
