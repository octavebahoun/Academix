<?php

namespace App\Http\Controllers\Api;

use App\Models\Departement;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DepartementController extends Controller
{
    public function index(Request $request)
    {
        $departements = Departement::withCount(['filieres', 'chefs'])
            ->when($request->search, fn($q, $s) => $q->where('nom', 'like', "%$s%")
                ->orWhere('code', 'like', "%$s%"))
            ->orderBy('nom')
            ->get();

        return response()->json(['data' => $departements]);
    }

    public function store(Request $request)
    {

        $admin = $request->user();
        if (!$admin) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        if (!$admin->isSuperAdmin()) {
            return response()->json([
                'message' => 'Accès interdit. Seul un Super Administrateur peut créer un département.'
            ], 403);
        }

        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'code' => 'required|string|max:10|unique:departements,code',
            'description' => 'nullable|string',
        ]);

        $validated['created_by'] = $admin->id;

        $departement = Departement::create($validated);

        return response()->json([
            'message' => 'Département créé avec succès.',
            'data' => $departement
        ], 201);
    }

    public function show($id)
    {
        $departement = Departement::with(['filieres', 'chefs'])
            ->findOrFail($id);

        return response()->json(['data' => $departement]);
    }

    public function update(Request $request, $id)
    {
        $departement = Departement::findOrFail($id);

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'code' => 'sometimes|string|max:10|unique:departements,code,' . $id,
            'description' => 'nullable|string',
        ]);

        $departement->update($validated);

        return response()->json([
            'message' => 'Département mis à jour avec succès.',
            'data' => $departement
        ]);
    }

    public function destroy($id)
    {
        $departement = Departement::withCount(['filieres', 'chefs'])->findOrFail($id);

        if ($departement->filieres_count > 0 || $departement->chefs_count > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer : ce département contient des filières ou des chefs actifs.'
            ], 409);
        }

        $departement->delete();
        return response()->noContent();
    }

    public function stats($id)
    {

    }
}
