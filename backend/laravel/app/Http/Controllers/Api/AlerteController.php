<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alerte;
use Illuminate\Http\Request;

class AlerteController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * LISTE DES ALERTES DE L'ÉTUDIANT
     * GET /api/v1/student/alertes
     * Accès : étudiant authentifié
     * ---------------------------------------------------------------
     *
     * Retourne les alertes de l'étudiant connecté, triées par date décroissante.
     *
     * Query string optionnels :
     *   ?lues=0    → uniquement les alertes non lues (est_lue = false)
     *   ?lues=1    → uniquement les alertes lues
     *   ?type=moyenne_faible → filtrer par type_alerte
     *              (valeurs possibles : moyenne_faible | deadline_proche | note_faible | absence)
     *
     * Retour (200) :
     * {
     *   "total": 5,
     *   "non_lues": 3,
     *   "alertes": [
     *     {
     *       "id": 12,
     *       "type_alerte": "moyenne_faible",
     *       "niveau_severite": "eleve",
     *       "titre": "Attention : votre moyenne chute !",
     *       "message": "Votre moyenne en Algorithmique est de 7.5/20",
     *       "actions_suggerees": ["Revoir le cours", "Consulter le prof"],
     *       "est_lue": false,
     *       "created_at": "2025-11-15T10:30:00Z"
     *     }
     *   ]
     * }
     *
     * Conseil :
     *   $query = Alerte::where('user_id', $user->id)
     *       ->when(isset($request->lues), fn($q) => $q->where('est_lue', (bool)$request->lues))
     *       ->when($request->type, fn($q,$t) => $q->where('type_alerte', $t))
     *       ->latest();
     * ---------------------------------------------------------------
     */
    public function index(Request $request)
    {
        // TODO: Récupérer l'étudiant connecté
        // $user = $request->user();

        // TODO: Récupérer les alertes avec filtres optionnels
        // $query = Alerte::where('user_id', $user->id)
        //     ->when($request->has('lues'), fn($q) => $q->where('est_lue', (bool)$request->lues))
        //     ->when($request->type, fn($q,$t) => $q->where('type_alerte', $t))
        //     ->latest();

        // TODO: Récupérer le compteur de non-lues
        // $nonLues = Alerte::where('user_id', $user->id)->where('est_lue', false)->count();

        // TODO: return response()->json([
        //     'total'    => $query->count(),
        //     'non_lues' => $nonLues,
        //     'alertes'  => $query->get(),
        // ]);
    }

    /**
     * ---------------------------------------------------------------
     * MARQUER UNE ALERTE COMME LUE
     * PATCH /api/v1/student/alertes/{id}/read
     * Accès : étudiant authentifié (propriétaire de l'alerte)
     * ---------------------------------------------------------------
     *
     * Met à jour est_lue = true pour l'alerte $id.
     *
     * ⚠️  Vérifier que l'alerte appartient à l'étudiant connecté :
     *     $alerte->user_id !== $request->user()->id → 403 Forbidden
     *     (un étudiant ne doit pas pouvoir marquer les alertes d'un autre)
     *
     * Idempotent : si l'alerte est déjà lue → retourner 200 sans erreur.
     *
     * Retour (200) :
     * { "message": "Alerte marquée comme lue", "alerte": { ...alerte mise à jour... } }
     * ---------------------------------------------------------------
     */
    public function markAsRead($id)
    {
        // TODO: Trouver l'alerte (404 si inexistante)
        // $alerte = Alerte::findOrFail($id);

        // TODO: Vérifier que l'alerte appartient bien à l'étudiant connecté
        // if ($alerte->user_id !== request()->user()->id) {
        //     return response()->json(['error' => 'Accès refusé'], 403);
        // }

        // TODO: Mettre à jour est_lue = true (idempotent)
        // $alerte->update(['est_lue' => true]);

        // TODO: return response()->json([
        //     'message' => 'Alerte marquée comme lue',
        //     'alerte'  => $alerte,
        // ]);
    }
}
