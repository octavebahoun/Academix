<?php
namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Filiere;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;

class FiliereController extends Controller
{

    public function index(Request $request)
    {
        $admin = $request->user();
        $filieres = Filiere::with('departement')
            ->withCount('users')
            ->when($admin && method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement(), function($query) use ($admin) {
                $query->where('departement_id', $admin->departement_id);
            })
            ->when($request->niveau, function($query, $niveau) {
                $query->where('niveau', $niveau);
            })
            ->orderBy('departement_id')
            ->orderBy('niveau')
            ->get();

        return response()->json($filieres);
    }

    public function store(Request $request)
    {       
        $admin = $request->user();
        if ($admin && method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement()) {
            $request->merge(['departement_id' => $admin->departement_id]);
        }

        $validated = $request->validate([
            'departement_id' => 'required|integer|exists:departements,id',
            'nom'  => 'required|string|max:100',
            'niveau'  => 'required|in:L1,L2,L3,M1,M2',
            'code'  => 'required|string|max:20|unique:filieres,code',
            'annee_academique' => 'required|string|max:20',
            'description' => 'nullable|string',
        ]);

        $filiere = Filiere::create($validated);
        return response()->json($filiere->load('departement'), 201);
    }

    public function show(Request $request, $id)
    {
        $filiere = Filiere::with(['departement', 'matieres'])
            ->withCount('users')
            ->findOrFail($id);

        $admin = $request->user();
        if ($admin && method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement()) {
            if ($filiere->departement_id !== $admin->departement_id) {
                return response()->json(['message' => 'Accès refusé. Cette filière n\'appartient pas à votre département.'], 403);
            }
        }

        return response()->json($filiere);
    }

    public function update(Request $request, $id)
    {
        $filiere = Filiere::findOrFail($id);
        $admin = $request->user();

        if ($admin && method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement()) {
            if ($filiere->departement_id !== $admin->departement_id) {
                return response()->json(['message' => 'Accès refusé. Cette filière n\'appartient pas à votre département.'], 403);
            }
        }

        $validated = $request->validate([
            'nom'              => 'sometimes|string|max:100',
            'niveau'           => 'sometimes|in:L1,L2,L3,M1,M2',
            'code'             => ['sometimes', 'string', 'max:20', Rule::unique('filieres','code')->ignore($id)],
            'annee_academique' => 'sometimes|string|max:20',
            'description'      => 'nullable|string',
        ]);

        $filiere->update($validated);
        return response()->json($filiere->load('departement'));
    }

    public function destroy(Request $request, $id)
    {
        $filiere = Filiere::withCount('users')->findOrFail($id);
        $admin = $request->user();

        if ($admin && method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement()) {
            if ($filiere->departement_id !== $admin->departement_id) {
                return response()->json(['message' => 'Accès refusé.'], 403);
            }
        }

        if ($filiere->users_count > 0) {
            return response()->json([
                'message' => "Impossible de supprimer la filière : {$filiere->users_count} étudiant(s) inscrit(s)."
            ], 409);
        }

        $filiere->delete();
        return response()->noContent();
    }

    public function etudiants(Request $request, $id)
    {
        $filiere = Filiere::findOrFail($id);
        $admin = $request->user();

        if ($admin && method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement()) {
            if ($filiere->departement_id !== $admin->departement_id) {
                return response()->json(['message' => 'Accès refusé.'], 403);
            }
        }

        $etudiants = User::select(['id','matricule','nom','prenom','email','telephone','is_active','annee_admission','last_login'])
            ->where('filiere_id', $id)
            ->when($request->search, function($query, $search) {
                $query->where('nom', 'like', "%{$search}%")
                      ->orWhere('prenom', 'like', "%{$search}%")
                      ->orWhere('matricule', 'like', "%{$search}%");
            })
            ->when($request->has('is_active'), function($query) use ($request) {
                $query->where('is_active', $request->is_active);
            })
            ->orderBy('nom')
            ->paginate(20);

        return response()->json($etudiants);
    }

    public function stats(Request $request, $id)
    {
        $filiere = Filiere::findOrFail($id);
        $admin = $request->user();

        if ($admin && method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement()) {
            if ($filiere->departement_id !== $admin->departement_id) {
                return response()->json(['message' => 'Accès refusé.'], 403);
            }
        }

        return response()->json([
            'message' => 'Statistiques en cours de construction.',
            'filiere_id' => $filiere->id
        ]);
    }
}
