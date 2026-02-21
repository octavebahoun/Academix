<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Admin;
use Illuminate\Http\Request;
use App\Models\ChefDepartement;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

    public function adminLogin(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);
        $admin = Admin::where('email', $request->email)->first();
        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Identifiants incorrects'], 401);
        }

        if (!$admin->is_active) {
            return response()->json(['message' => 'Compte désactivé. Contactez le responsable.'], 403);
        }
        $admin->update([
            'last_login'  => now(),
            'is_connect'  => true,
        ]);

        $token = $admin->createToken('admin-token')->plainTextToken;

        return response()->json([
            'token'      => $token,
            'token_type' => 'Bearer',
            'admin'      => $admin,
            'role'       => 'super_admin',
        ]);
    }

    public function adminLogout(Request $request)
    {

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function chefLogin(Request $request)
    {

        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $chef = ChefDepartement::where('email', $request->email)->first();

        if (!$chef || !Hash::check($request->password, $chef->password)) {
            return response()->json(['message' => 'Identifiants incorrects'], 401);
        }

        if (!$chef->is_active) {
            return response()->json(['message' => 'Compte désactivé. Contactez le Super Administrateur.'], 403);
        }

        $chef->update(['last_login' => now()]);

        $token = $chef->createToken('chef-token')->plainTextToken;

        return response()->json([
            'token'      => $token,
            'token_type' => 'Bearer',
            'chef'       => $chef,
            'role'       => 'chef_departement',
        ]);
    }

    public function chefLogout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function studentRegister(Request $request)
    {

        $admin = $request->user();
        if (!$admin) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        $isSuperAdmin = method_exists($admin, 'isSuperAdmin') && $admin->isSuperAdmin();
        $isChef = method_exists($admin, 'isChefDepartement') && $admin->isChefDepartement();

        if (!($isSuperAdmin || $isChef)) {
            return response()->json(['message' => 'Non autorisé. Seul un administrateur peut enregistrer un étudiant.'], 403);
        }

        $request->validate([
            'matricule'             => 'required|string', 
            'nom'                   => 'required|string|max:100',
            'prenom'                => 'required|string|max:100',
            'filiere_id'            => 'required|integer|exists:filieres,id',
            'email'                 => 'nullable|email', 
            'telephone'             => 'nullable|string|max:20',
        ]);

        if ($isChef) {
            $filiere = \App\Models\Filiere::find($request->filiere_id);
            if ($filiere && $filiere->departement_id !== $admin->departement_id) {
                return response()->json(['message' => 'Non autorisé. Cette filière ne fait pas partie de votre département.'], 403);
            }
        }

        $user = User::updateOrCreate(
            ['matricule' => $request->matricule],
            [
                'nom'              => $request->nom,
                'prenom'           => $request->prenom,
                'filiere_id'       => $request->filiere_id,
                'email'            => $request->email,
                'telephone'        => $request->telephone,
                'is_active'        => true, 
                'annee_admission'  => date('Y'),
                'password'         => Hash::make($request->matricule), 
            ]
        );

        return response()->json([
            'message' => 'Étudiant enregistré avec succès.',
            'user'    => $user->load('filiere'),
        ], 201);
    }
    public function studentActivate(Request $request)
    {
        $request->validate([
            'matricule' => 'required|string|exists:users,matricule',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('matricule', $request->matricule)->first();

        if ($user->is_active && $user->email) {
            return response()->json([
                'message' => 'Ce compte est déjà activé. Veuillez vous connecter.'
            ], 422);
        }

        $user->update([
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Compte activé avec succès. Vous pouvez maintenant vous connecter.',
            'user'    => $user->load('filiere'),
        ]);
    }

    public function studentLogin(Request $request)
    {

        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('filiere.departement')
            ->where('email', $request->email)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Compte désactivé.'], 403);
        }

        $user->update(['last_login' => now()]);

        $token = $user->createToken('student-token')->plainTextToken;

        return response()->json([
            'token'      => $token,
            'token_type' => 'Bearer',
            'user'       => $user,
            'role'       => 'student',
        ]);
    }

    public function studentLogout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function adminRegister(Request $request)
    {
        $validated = $request->validate([
            'nom'       => 'required|string|max:100',
            'prenom'    => 'required|string|max:100',
            'email'     => 'required|email|unique:super_admins,email',
            'password'  => 'required|string|min:8|confirmed',
            'telephone' => 'nullable|string|max:20',
            'photo'     => 'nullable|string|max:255',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $admin = Admin::create($validated);

        return response()->json([
            'message' => 'Super Administrateur créé avec succès.',
            'admin'   => $admin,
        ], 201);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        if ($user instanceof Admin) {
            return response()->json([
                'type'   => 'super_admin',
                'profil' => $user,
            ]);
        }

        if ($user instanceof ChefDepartement) {
            return response()->json([
                'type'   => 'chef_departement',
                'profil' => $user->load('departement'),
            ]);
        }
        return response()->json([
            'type'   => 'student',
            'profil' => $user->load('filiere.departement'),
        ]);
    }
}
