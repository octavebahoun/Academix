<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

// This won't work easily because the server is separate.
// But I can use the Dispatcher to simulate a request.

use Illuminate\Http\Request;

$request = Request::create('/api/v1/auth/admin/login', 'POST', [
    'email' => 'mourchidolawale@mail.com',
    'password' => 'password123'
]);
$request->headers->set('Accept', 'application/json');

$response = $app->handle($request);

echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
