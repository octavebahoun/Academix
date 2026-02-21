<?php
namespace App\Http\Controllers\Api;

use App\Models\Alerte;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AlerteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Alerte::where('user_id', $user->id)
            ->when($request->has('lues'), function($q) use ($request) {
                $q->where('est_lue', (bool)$request->lues);
            })
            ->when($request->type, function($q, $t) {
                $q->where('type_alerte', $t);
            })
            ->latest();

        $nonLues = Alerte::where('user_id', $user->id)->where('est_lue', false)->count();
        $total = $query->count();

        $alertes = $query->get()->map(function($alerte) {
             if (is_string($alerte->actions_suggerees)) {
                 $alerte->actions_suggerees = json_decode($alerte->actions_suggerees, true);
             }
             return $alerte;
        });

        return response()->json([
            'total'    => $total,
            'non_lues' => $nonLues,
            'alertes'  => $alertes,
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $alerte = Alerte::findOrFail($id);

        if ($alerte->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }
        $alerte->update(['est_lue' => true]);
        return response()->json([
            'message' => 'Alerte marquée comme lue',
            'alerte'  => $alerte,
        ]);
    }
}
