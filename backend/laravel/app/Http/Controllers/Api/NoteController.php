<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\User;
use App\Models\Matiere;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * LISTE DES NOTES
     * ---------------------------------------------------------------
     */
    public function index(Request $request)
    {
        $admin = $request->user();

        $notes = Note::with(['user', 'matiere'])
            ->when($admin && method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement(), function($query) use ($admin) {
                $query->whereHas('user.filiere', function($q) use ($admin) {
                    $q->where('departement_id', $admin->departement_id);
                });
            })
            ->when($request->user_id, function($query, $userId) {
                $query->where('user_id', $userId);
            })
            ->when($request->matiere_id, function($query, $matiereId) {
                $query->where('matiere_id', $matiereId);
            })
            ->orderBy('date_evaluation', 'desc')
            ->paginate(20);

        return response()->json($notes);
    }

    /**
     * ---------------------------------------------------------------
     *  CRÉER UNE NOTE MANUELLEMENT
     * ---------------------------------------------------------------
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id'          => 'required|integer|exists:users,id',
            'matiere_id'       => 'required|integer|exists:matieres,id',
            'note'             => 'required|numeric|min:0',
            'note_max'         => 'nullable|numeric|min:1',
            'type_evaluation'  => 'required|in:Devoir,Partiel,TP,Projet,Examen',
            'coefficient'      => 'nullable|integer|min:1',
            'date_evaluation'  => 'required|date',
            'semestre'         => 'required|in:S1,S2',
            'annee_academique' => 'required|string|max:20',
        ]);

        $admin = $request->user();
        $user = User::with('filiere')->findOrFail($validated['user_id']);

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $user->filiere->departement_id !== $admin->departement_id) {
            return response()->json(['message' => 'L\'étudiant n\'appartient pas à votre département.'], 403);
        }

        if (isset($validated['note_max']) && $validated['note'] > $validated['note_max']) {
            return response()->json(['message' => 'La note ne peut pas être supérieure à la note_max.'], 422);
        }

        $validated['created_by_admin_id'] = $admin->id;

        $note = Note::create($validated);
        return response()->json($note->load(['user', 'matiere']), 201);
    }

    /**
     * ---------------------------------------------------------------
     * MODIFIER UNE NOTE MANUELLEMENT
     * ---------------------------------------------------------------
     */
    public function update(Request $request, $id)
    {
        $note = Note::findOrFail($id);
        $note->load('user.filiere');

        $admin = $request->user();
        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $note->user->filiere->departement_id !== $admin->departement_id) {
            return response()->json(['message' => 'L\'étudiant n\'appartient pas à votre département.'], 403);
        }

        $validated = $request->validate([
            'note'             => 'sometimes|numeric|min:0',
            'note_max'         => 'nullable|numeric|min:1',
            'type_evaluation'  => 'sometimes|in:Devoir,Partiel,TP,Projet,Examen',
            'coefficient'      => 'nullable|integer|min:1',
            'date_evaluation'  => 'sometimes|date',
            'semestre'         => 'sometimes|in:S1,S2',
            'annee_academique' => 'sometimes|string|max:20',
        ]);

        $noteToCheck = isset($validated['note']) ? $validated['note'] : $note->note;
        $maxToCheck = isset($validated['note_max']) ? $validated['note_max'] : $note->note_max;

        if ($noteToCheck > $maxToCheck) {
            return response()->json(['message' => 'La note ne peut pas être supérieure à la note_max.'], 422);
        }

        $note->update($validated);
        return response()->json($note->load(['user', 'matiere']));
    }

    /**
     * ---------------------------------------------------------------
     * SUPPRIMER UNE NOTE
     * ---------------------------------------------------------------
     */
    public function destroy(Request $request, $id)
    {
        $note = Note::findOrFail($id);
        $note->load('user.filiere');

        $admin = $request->user();
        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $note->user->filiere->departement_id !== $admin->departement_id) {
            return response()->json(['message' => 'L\'étudiant n\'appartient pas à votre département.'], 403);
        }

        $note->delete();
        return response()->noContent();
    }
}
