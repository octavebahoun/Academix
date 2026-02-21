<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmploiTempsFiliere;
use App\Models\Filiere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmploiTempsController extends Controller
{

    public function index(Request $request, $filiereId)
    {
        $filiere = Filiere::findOrFail($filiereId);
        $admin = $request->user();

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $filiere->departement_id !== $admin->departement_id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $edt = EmploiTempsFiliere::with('matiere')
            ->where('filiere_id', $filiereId)
            ->when($request->semestre, function($query, $semestre) {
                $query->where('semestre', $semestre);
            })
            ->when($request->jour, function($query, $jour) {
                $query->where('jour', $jour);
            })
            ->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
            ->orderBy('heure_debut')
            ->get();

        return response()->json($edt);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'filiere_id'  => 'required|integer|exists:filieres,id',
            'matiere_id'  => 'required|integer|exists:matieres,id',
            'jour'        => 'required|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin'   => 'required|date_format:H:i|after:heure_debut',
            'salle'       => 'nullable|string|max:50',
            'type_cours'  => 'required|in:CM,TD,TP',
            'enseignant'  => 'nullable|string|max:100',
            'semestre'    => 'required|in:S1,S2',
        ]);

        $admin = $request->user();
        $filiere = Filiere::findOrFail($validated['filiere_id']);

        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $filiere->departement_id !== $admin->departement_id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $matiereLiee = DB::table('filiere_matieres')
            ->where('filiere_id', $validated['filiere_id'])
            ->where('matiere_id', $validated['matiere_id'])
            ->exists();

        if (!$matiereLiee) {
            return response()->json(['message' => 'Cette matière n\'appartient pas à cette filière'], 422);
        }

        if (!empty($validated['salle'])) {
            $conflit = EmploiTempsFiliere::where('jour', $validated['jour'])
                ->where('salle', $validated['salle'])
                ->where('semestre', $validated['semestre'])
                ->where('heure_debut', '<', $validated['heure_fin'])
                ->where('heure_fin', '>', $validated['heure_debut'])
                ->exists();

            if ($conflit) {
                return response()->json(['message' => 'Conflit de salle détecté'], 409);
            }
        }

        $cours = EmploiTempsFiliere::create($validated);
        return response()->json($cours->load('matiere'), 201);
    }

    public function update(Request $request, $id)
    {
        $cours = EmploiTempsFiliere::findOrFail($id);
        $cours->load('filiere');

        $admin = $request->user();
        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $cours->filiere->departement_id !== $admin->departement_id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $validated = $request->validate([
            'matiere_id'  => 'sometimes|integer|exists:matieres,id',
            'jour'        => 'sometimes|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure_debut' => 'sometimes|date_format:H:i',
            'heure_fin'   => 'sometimes|date_format:H:i|after:heure_debut',
            'salle'       => 'nullable|string|max:50',
            'type_cours'  => 'sometimes|in:CM,TD,TP',
            'enseignant'  => 'nullable|string|max:100',
            'semestre'    => 'sometimes|in:S1,S2',
        ]);

        if (isset($validated['matiere_id']) && $validated['matiere_id'] != $cours->matiere_id) {
            $matiereLiee = DB::table('filiere_matieres')
                ->where('filiere_id', $cours->filiere_id)
                ->where('matiere_id', $validated['matiere_id'])
                ->exists();

            if (!$matiereLiee) {
                return response()->json(['message' => 'La nouvelle matière n\'appartient pas à la filière'], 422);
            }
        }

        $cours->update($validated);
        return response()->json($cours->fresh()->load('matiere'));
    }

    public function destroy(Request $request, $id)
    {
        $cours = EmploiTempsFiliere::findOrFail($id);
        $cours->load('filiere');

        $admin = $request->user();
        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();
        if ($isChef && $cours->filiere->departement_id !== $admin->departement_id) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $cours->delete();
        return response()->noContent();
    }
}
