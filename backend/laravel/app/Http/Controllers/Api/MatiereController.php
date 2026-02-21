<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Matiere;
use App\Models\Filiere;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MatiereController extends Controller
{

    public function index(Request $request)
    {
        $matieres = Matiere::withCount('filieres')
            ->when($request->search, function ($query, $search) {
                $query->where('nom', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
            })
            ->orderBy('nom')
            ->get();

        return response()->json($matieres);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom'         => 'required|string|max:100',
            'code'        => 'required|string|max:20|unique:matieres,code',
            'coefficient' => 'sometimes|integer|min:1|max:10',
            'description' => 'nullable|string',
            'enseignant'  => 'nullable|string|max:100',
        ]);

        $matiere = Matiere::create($validated);
        return response()->json($matiere, 201);
    }

    public function show($id)
    {
        $matiere = Matiere::withCount('filieres')->findOrFail($id);
        return response()->json($matiere);
    }

    public function update(Request $request, $id)
    {
        $matiere = Matiere::findOrFail($id);

        $validated = $request->validate([
            'nom'         => 'sometimes|string|max:100',
            'code'        => ['sometimes', 'string', 'max:20', Rule::unique('matieres', 'code')->ignore($id)],
            'coefficient' => 'sometimes|integer|min:1|max:10',
            'description' => 'nullable|string',
            'enseignant'  => 'nullable|string|max:100',
        ]);

        $matiere->update($validated);
        return response()->json($matiere);
    }

    public function destroy($id)
    {
        $matiere = Matiere::findOrFail($id);

        if ($matiere->notes()->count() > 0) {
            return response()->json(['message' => 'Des notes existent pour cette matière'], 409);
        }

        $matiere->delete();
        return response()->noContent();
    }

    public function assignToFiliere(Request $request, $filiereId)
    {
        $filiere = Filiere::findOrFail($filiereId);
        $admin = $request->user();

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $filiere->departement_id !== $admin->departement_id) {
            return response()->json(['message' => 'Non autorisé. Cette filière n\'appartient pas à votre département.'], 403);
        }

        $validated = $request->validate([
            'matiere_id' => 'required|integer|exists:matieres,id',
            'semestre'   => 'required|in:S1,S2',
        ]);

        if ($filiere->matieres()->where('matiere_id', $validated['matiere_id'])->exists()) {
            return response()->json(['message' => 'Matière déjà assignée à cette filière'], 409);
        }

        $filiere->matieres()->attach($validated['matiere_id'], ['semestre' => $validated['semestre']]);

        return response()->json([
            'message' => 'Matière assignée avec succès', 
            'semestre' => $validated['semestre']
        ], 201);
    }

    public function removeFromFiliere(Request $request, $filiereId, $matiereId)
    {
        $filiere = Filiere::findOrFail($filiereId);
        $admin = $request->user();

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $filiere->departement_id !== $admin->departement_id) {
            return response()->json(['message' => 'Non autorisé. Cette filière n\'appartient pas à votre département.'], 403);
        }

        if (!$filiere->matieres()->where('matiere_id', $matiereId)->exists()) {
            return response()->json(['message' => 'Matière non trouvée dans cette filière'], 404);
        }

        $notesExistent = Note::whereHas('user', function ($q) use ($filiereId) {
                $q->where('filiere_id', $filiereId);
            })
            ->where('matiere_id', $matiereId)
            ->exists();

        if ($notesExistent) {
            return response()->json(['message' => 'Des notes existent pour cette matière dans cette filière'], 409);
        }

        $filiere->matieres()->detach($matiereId);

        return response()->noContent();
    }
}
