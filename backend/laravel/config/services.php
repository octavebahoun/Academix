<?php

return [

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Serveur Node.js — webhook interne pour les alertes temps réel
    'node' => [
        'url' => env('NODE_BACKEND_URL', 'http://localhost:3001'),
        'webhook_secret' => env('WEBHOOK_SECRET', ''),
    ],

    // Service IA Python (FastAPI)
    'python_ai' => [
        'url' => env('PYTHON_AI_SERVICE_URL', 'http://localhost:8001'),
        'internal_key' => env('PYTHON_AI_INTERNAL_KEY', ''),
    ],

    // Google API (Calendar & Tasks)
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect_uri' => env('GOOGLE_REDIRECT_URI'),
    ],

];
