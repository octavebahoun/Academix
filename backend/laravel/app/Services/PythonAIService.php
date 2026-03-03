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
     *
     * @param int $studentId
     * @return array
     */
    public function analyzeStudent(int $studentId): array
    {
        try {
            // Transmet le Bearer token de l'utilisateur connecté au service Python
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
                    'data' => $content['data']
                ];
            }

            Log::error("PythonAIService error", [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'error' => "Le service d'analyse IA a renvoyé une erreur ({$response->status()})."
            ];

        } catch (\Exception $e) {
            Log::error("PythonAIService exception: " . $e->getMessage());
            return [
                'success' => false,
                'error' => "Impossible de contacter le service d'intelligence artificielle."
            ];
        }
    }
}
