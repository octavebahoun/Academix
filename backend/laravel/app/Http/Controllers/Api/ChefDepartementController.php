<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\ChefDepartement;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;

class ChefDepartementController extends Controller
{

    public function index(Request $request)
    {

        $chefs = ChefDepartement::with('departement')
            ->orderBy('nom')
            ->get();
        return response()->json([
            'data' => $chefs
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',

            'email' => 'required|email|unique:chefs_departement,email',
            'password' => 'required|string|min:8',
            'telephone' => 'nullable|string|max:20',
            'departement_id' => 'required|integer|exists:departements,id',
        ]);
        $dejaChef = ChefDepartement::where('departement_id', $validated['departement_id'])
            ->where('is_active', true)
            ->exists();
        if ($dejaChef) {
            return response()->json([
                'error' => 'Ce département a déjà un chef de département actif.'
            ], 409);
        }

        $validated['password'] = Hash::make($validated['password']);
        $validated['created_by_admin'] = $request->user()->id;
        $chef = ChefDepartement::create($validated);
        return response()->json([
            'message' => 'Chef de département créé avec succès !',
            'chef' => $chef->load('departement'),
        ], 201);
    }
    public function show($id)
    {
        $chef = ChefDepartement::with(['departement', 'createdByAdmin'])
            ->findOrFail($id);

        return response()->json($chef);
    }
    public function update(Request $request, $id)
    {
        $chef = ChefDepartement::findOrFail($id);
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:100',
            'prenom' => 'sometimes|string|max:100',
            'email' => ['sometimes', 'email', Rule::unique('chefs_departement', 'email')->ignore($id)],
            'password' => 'sometimes|string|min:8',
            'telephone' => 'nullable|string|max:20',
            'departement_id' => 'sometimes|integer|exists:departements,id',
        ]);
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }
        $chef->update($validated);
        return response()->json([
            'message' => 'Chef de département mis à jour.',
            'chef' => $chef->load('departement'),
        ]);
    }
    public function destroy($id)
    {
        $chef = ChefDepartement::findOrFail($id);
        $chef->tokens()->delete();
        $chef->delete();
        return response()->noContent(); 
    }
    public function toggle($id)
    {
        $chef = ChefDepartement::findOrFail($id);
        $chef->is_active = !$chef->is_active;
        $chef->save();
        if (!$chef->is_active) {
            $chef->tokens()->delete();
            $message = 'Compte désactivé. Sessions révoquées.';
        } else {
            $message = 'Compte réactivé.';
        }
        return response()->json([
            'message' => $message,
            'is_active' => $chef->is_active,
        ]);
    }
}
