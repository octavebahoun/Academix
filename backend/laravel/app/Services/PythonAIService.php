<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PythonAIService
{
    private string $baseUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.python_ai.url', 'http://localhost:8001');
    }

    /**
     * Lance l'analyse IA pour un étudiant en appelant le service Python FastAPI.
     * Retry : 2 tentatives max, pas de retry sur erreur client (4xx).
     */
    public function analyzeStudent(int $studentId): array
    {
        $maxAttempts = 2;
        $lastError = null;

        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                $token = request()->bearerToken();

                $response = Http::timeout(45)
                    ->withHeaders([
                        'Authorization' => "Bearer {$token}",
                    ])
                    ->get("{$this->baseUrl}/api/v1/analysis/{$studentId}");

                if ($response->successful()) {
                    $content = $response->json();
                    return [
                        'success' => true,
                        'data' => $content['data'] ?? $content,
                    ];
                }

                $lastError = "Le service d'analyse IA a renvoyé une erreur ({$response->status()}).";
                Log::warning("PythonAIService tentative {$attempt}/{$maxAttempts}", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                // Ne pas retenter sur les erreurs client (4xx)
                if ($response->status() >= 400 && $response->status() < 500) {
                    break;
                }

            } catch (\Exception $e) {
                $lastError = "Impossible de contacter le service d'intelligence artificielle.";
                Log::warning("PythonAIService exception tentative {$attempt}/{$maxAttempts}: " . $e->getMessage());
            }

            if ($attempt < $maxAttempts) {
                usleep(500_000); // 500ms avant retry
            }
        }

        Log::error("PythonAIService: toutes les tentatives ont échoué", ['attempts' => $maxAttempts]);
        return [
            'success' => false,
            'error' => $lastError,
        ];
    }
}
