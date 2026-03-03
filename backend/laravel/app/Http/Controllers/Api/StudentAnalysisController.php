<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentAnalysis;
use App\Notifications\StudentAnalysisNotification;
use App\Services\PythonAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StudentAnalysisController extends Controller
{
    public function __construct(protected PythonAIService $aiService)
    {
    }

    /**
     * Lancer une nouvelle analyse IA complète pour l'étudiant connecté.
     */
    public function analyze(Request $request): JsonResponse
    {
        $student = $request->user();

        // 1. Anti-spam : 1 analyse maximum toutes les 24h
        $lastAnalysis = StudentAnalysis::forUser($student->id)
            ->recent(24)
            ->latest()
            ->first();

        if ($lastAnalysis) {
            return response()->json([
                'success' => false,
                'message' => "Une analyse a déjà été effectuée il y a moins de 24h.",
                'data' => $lastAnalysis
            ], 429);
        }

        // 2. Appel du service Python
        $result = $this->aiService->analyzeStudent($student->id);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => "L'IA n'a pas pu traiter la demande : " . ($result['error'] ?? 'Erreur inconnue')
            ], 502);
        }

        // 3. Validation de la structure retournée par Python
        $data = $result['data'] ?? [];
        $analysisData = $data['analysis'] ?? null;
        $contextData = $data['context'] ?? null;

        if (
            !$analysisData || !$contextData
            || !isset($analysisData['message_principal'])
            || !isset($contextData['moyenne_generale'])
        ) {
            Log::error('PythonAIService: structure de réponse invalide', ['data' => $data]);
            return response()->json([
                'success' => false,
                'message' => "Le service IA a retourné une réponse inattendue. Veuillez réessayer.",
            ], 502);
        }

        // 4. Enregistrement en base de données
        try {
            $analysis = StudentAnalysis::create([
                'user_id' => $student->id,
                'moyenne_generale' => $contextData['moyenne_generale'],
                'niveau_alerte' => $analysisData['niveau_alerte'] ?? 'info',
                'message_principal' => $analysisData['message_principal'],
                'conseils' => $analysisData['conseils'] ?? [],
                'matieres_prioritaires' => $analysisData['matieres_prioritaires'] ?? [],
                'point_positif' => $analysisData['point_positif'] ?? null,
                'contexte_raw' => $contextData,
            ]);

            // 5. Dispatcher la notification (mail + database + push VAPID)
            $student->notify(new StudentAnalysisNotification($analysis));

            return response()->json([
                'success' => true,
                'message' => 'Analyse IA générée et sauvegardée avec succès.',
                'data' => $analysis
            ]);
        } catch (\Exception $e) {
            Log::error("Erreur sauvegarde analyse IA: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur interne lors de la sauvegarde de l\'analyse.',
            ], 500);
        }
    }

    /**
     * Récupérer l'historique des analyses de l'étudiant connecté.
     */
    public function history(Request $request): JsonResponse
    {
        $analyses = StudentAnalysis::forUser($request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $analyses
        ]);
    }

    /**
     * Marquer une analyse comme ayant été envoyée par mail/notif.
     */
    public function markAsSent(Request $request, int $id): JsonResponse
    {
        $analysis = StudentAnalysis::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$analysis) {
            return response()->json([
                'success' => false,
                'message' => 'Analyse non trouvée ou accès non autorisé.'
            ], 404);
        }

        $analysis->update(['sent_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'L\'envoi du bilan a été marqué comme effectué.',
            'sent_at' => $analysis->sent_at
        ]);
    }
}
