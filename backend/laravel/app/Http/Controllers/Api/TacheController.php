<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tache;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TacheController extends Controller
{

    public function index(Request $request)
    {
        $taches = Tache::with('matiere:id,nom,code')
            ->where('user_id', $request->user()->id)
            ->when($request->statut, function($query, $statut) {
                $query->where('statut', $statut);
            })
            ->when($request->priorite, function($query, $priorite) {
                $query->where('priorite', $priorite);
            })
            ->when($request->matiere_id, function($query, $matiereId) {
                $query->where('matiere_id', $matiereId);
            })
            ->orderBy('date_limite')
            ->get();

        return response()->json($taches);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titre'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'matiere_id'  => 'nullable|integer|exists:matieres,id',
            'date_limite' => 'required|date|after:now',
            'priorite'    => 'sometimes|in:basse,moyenne,haute',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['statut']  = 'a_faire';

        $tache = Tache::create($validated);
        return response()->json($tache->load('matiere:id,nom,code'), 201);
    }

    public function show(Request $request, $id)
    {
        $tache = Tache::with('matiere:id,nom,code')->findOrFail($id);

        if ($tache->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return response()->json($tache);
    }

    public function update(Request $request, $id)
    {
        $tache = Tache::findOrFail($id);

        if ($tache->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $validated = $request->validate([
            'titre'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'matiere_id'  => 'nullable|integer|exists:matieres,id',
            'date_limite' => 'sometimes|date',
            'priorite'    => 'sometimes|in:basse,moyenne,haute',
            'statut'      => 'sometimes|in:a_faire,en_cours,terminee',
        ]);

        $tache->update($validated);
        return response()->json($tache->load('matiere:id,nom,code'));
    }

    public function destroy(Request $request, $id)
    {
        $tache = Tache::findOrFail($id);

        if ($tache->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $tache->delete();
        return response()->noContent();
    }

    public function complete(Request $request, $id)
    {
        $tache = Tache::findOrFail($id);

        if ($tache->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $tache->update(['statut' => 'terminee']);
        return response()->json([
            'message' => 'Tâche marquée comme terminée',
            'tache'   => $tache,
        ]);
    }
}
