<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * ---------------------------------------------------------------
     * CONNEXION ADMIN (super_admin ou chef_departement)
     * POST /api/v1/auth/admin/login
     * Accès : public (non protégé)
     * ---------------------------------------------------------------
     *
     * Body attendu (JSON) :
     *   - email    (required|email)
     *   - password (required|string)
     *
     * Logique :
     *   1. Valider les champs
     *   2. Chercher l'admin par email : Admin::where('email', $email)->first()
     *   3. Vérifier le mot de passe : Hash::check($password, $admin->password)
     *   4. Vérifier que le compte est actif : $admin->is_active === true
     *   5. Mettre à jour last_login : $admin->update(['last_login' => now()])
     *   6. Créer un token Sanctum : $admin->createToken('admin-token')->plainTextToken
     *   7. Retourner le token + les infos de l'admin
     *
     * Retour succès (200) :
     * {
     *   "token": "1|xxxxx",
     *   "token_type": "Bearer",
     *   "admin": { "id": 1, "nom": "ADMIN", "role": "super_admin", "departement": {...} }
     * }
     *
     * Retour erreur (401) :
     * { "message": "Identifiants incorrects" }
     *
     * ⚠️  Ne pas utiliser Auth::attempt() car on a un guard 'admin' séparé.
     *     La vérification manuelle du hash est nécessaire ici.
     * ---------------------------------------------------------------
     */
    public function adminLogin(Request $request)
    {
        // TODO: Valider les champs entrants
        // $request->validate([
        //     'email'    => 'required|email',
        //     'password' => 'required|string',
        // ]);

        // TODO: Chercher l'admin par email
        // $admin = Admin::with('departement')->where('email', $request->email)->first();

        // TODO: Vérifier les credentials et le statut
        // if (!$admin || !Hash::check($request->password, $admin->password)) {
        //     return response()->json(['message' => 'Identifiants incorrects'], 401);
        // }
        // if (!$admin->is_active) {
        //     return response()->json(['message' => 'Compte désactivé'], 403);
        // }

        // TODO: Mettre à jour la date de dernière connexion
        // $admin->update(['last_login' => now()]);

        // TODO: Révoquer les anciens tokens et créer un nouveau
        // $admin->tokens()->delete(); // optionnel : une session à la fois
        // $token = $admin->createToken('admin-token')->plainTextToken;

        // TODO: Retourner le token et le profil
        // return response()->json([
        //     'token'      => $token,
        //     'token_type' => 'Bearer',
        //     'admin'      => $admin,
        // ]);
    }

    /**
     * ---------------------------------------------------------------
     * DÉCONNEXION ADMIN
     * POST /api/v1/auth/admin/logout
     * Accès : admin authentifié (middleware auth:sanctum)
     * ---------------------------------------------------------------
     *
     * Logique :
     *   Révoquer le token courant de l'admin connecté.
     *   $request->user()->currentAccessToken()->delete()
     *
     * Retour (200) :
     * { "message": "Déconnecté avec succès" }
     * ---------------------------------------------------------------
     */
    public function adminLogout(Request $request)
    {
        // TODO: Supprimer le token courant
        // $request->user()->currentAccessToken()->delete();
        // return response()->json(['message' => 'Déconnecté avec succès']);
    }

    /**
     * ---------------------------------------------------------------
     * INSCRIPTION ÉTUDIANT (via matricule pré-existant)
     * POST /api/v1/auth/student/register
     * Accès : public (non protégé)
     * ---------------------------------------------------------------
     *
     * Body attendu (JSON) :
     *   - matricule        (required|string|exists:users,matricule) ← doit déjà exister (importé par admin)
     *   - email            (required|email|unique:users,email)
     *   - password         (required|string|min:8|confirmed)
     *   - password_confirmation (required)
     *   - telephone        (nullable|string)
     *
     * Logique :
     *   1. Valider les champs
     *   2. Chercher l'User par matricule (créé lors de l'import CSV)
     *      → Si non trouvé : 422 "Matricule inconnu"
     *   3. Vérifier que l'étudiant n'a pas déjà un mot de passe défini (is_active et email vide)
     *      → Si déjà inscrit : 409 "Compte déjà activé"
     *   4. Mettre à jour : email, password (hashé), telephone
     *   5. Créer un token Sanctum et retourner
     *
     * ⚠️  Le flow attendu : l'admin importe les étudiants via CSV (avec matricule, nom, prenom, filiere_id).
     *     L'étudiant complète ensuite son compte ici avec email + password.
     * ---------------------------------------------------------------
     */
    public function studentRegister(Request $request)
    {
        // TODO: Valider les champs
        // $request->validate([
        //     'matricule'             => 'required|string|exists:users,matricule',
        //     'email'                 => 'required|email|unique:users,email',
        //     'password'              => 'required|string|min:8|confirmed',
        //     'telephone'             => 'nullable|string|max:20',
        // ]);

        // TODO: Trouver l'étudiant par matricule
        // $user = User::where('matricule', $request->matricule)->firstOrFail();

        // TODO: Vérifier qu'il n'est pas déjà inscrit (email non renseigné = pas encore activé)
        // if (!empty($user->email)) {
        //     return response()->json(['message' => 'Ce compte est déjà activé'], 409);
        // }

        // TODO: Activer le compte en renseignant email + password
        // $user->update([
        //     'email'      => $request->email,
        //     'password'   => Hash::make($request->password),
        //     'telephone'  => $request->telephone,
        //     'is_active'  => true,
        // ]);

        // TODO: Créer le token et retourner
        // $token = $user->createToken('student-token')->plainTextToken;
        // return response()->json([
        //     'token'      => $token,
        //     'token_type' => 'Bearer',
        //     'user'       => $user->load('filiere'),
        // ], 201);
    }

    /**
     * ---------------------------------------------------------------
     * CONNEXION ÉTUDIANT
     * POST /api/v1/auth/student/login
     * Accès : public (non protégé)
     * ---------------------------------------------------------------
     *
     * Body attendu (JSON) :
     *   - email    (required|email)      ← ou matricule selon le choix UX
     *   - password (required|string)
     *
     * Logique identique à adminLogin mais sur le modèle User.
     *   1. Chercher par email : User::where('email', $email)->first()
     *   2. Hash::check($password, $user->password)
     *   3. Vérifier $user->is_active
     *   4. Mettre à jour last_login
     *   5. createToken('student-token')
     *
     * Retour succès (200) :
     * {
     *   "token": "2|xxxxx",
     *   "token_type": "Bearer",
     *   "user": { "id": 5, "matricule": "ETU001", "nom": "...", "filiere": {...} }
     * }
     * ---------------------------------------------------------------
     */
    public function studentLogin(Request $request)
    {
        // TODO: Valider les champs
        // $request->validate([
        //     'email'    => 'required|email',
        //     'password' => 'required|string',
        // ]);

        // TODO: Chercher l'étudiant par email avec sa filière
        // $user = User::with('filiere.departement')->where('email', $request->email)->first();

        // TODO: Vérifier les credentials
        // if (!$user || !Hash::check($request->password, $user->password)) {
        //     return response()->json(['message' => 'Identifiants incorrects'], 401);
        // }
        // if (!$user->is_active) {
        //     return response()->json(['message' => 'Compte désactivé'], 403);
        // }

        // TODO: Mettre à jour last_login + générer token
        // $user->update(['last_login' => now()]);
        // $token = $user->createToken('student-token')->plainTextToken;
        // return response()->json(['token' => $token, 'token_type' => 'Bearer', 'user' => $user]);
    }

    /**
     * ---------------------------------------------------------------
     * DÉCONNEXION ÉTUDIANT
     * POST /api/v1/auth/student/logout
     * Accès : étudiant authentifié (middleware auth:sanctum)
     * ---------------------------------------------------------------
     *
     * Identique à adminLogout : révoquer le token courant.
     * $request->user()->currentAccessToken()->delete()
     *
     * Retour (200) : { "message": "Déconnecté avec succès" }
     * ---------------------------------------------------------------
     */
    public function studentLogout(Request $request)
    {
        // TODO: Supprimer le token courant
        // $request->user()->currentAccessToken()->delete();
        // return response()->json(['message' => 'Déconnecté avec succès']);
    }

    /**
     * ---------------------------------------------------------------
     * PROFIL DE L'UTILISATEUR CONNECTÉ
     * GET /api/v1/auth/me
     * Accès : tout utilisateur authentifié (admin ou étudiant)
     * ---------------------------------------------------------------
     *
     * Logique :
     *   Sanctum injecte l'utilisateur dans $request->user().
     *   Il peut être un Admin ou un User selon le token utilisé.
     *
     *   Pour distinguer :
     *     - Vérifier si $request->user() est une instance de Admin::class
     *     - Ou ajouter un champ 'type' dans le token (via 'abilities' Sanctum)
     *
     * Retour (200) :
     *   Si admin  : { "type": "admin",   "profil": { ...admin avec departement... } }
     *   Si étudiant : { "type": "student", "profil": { ...user avec filiere... } }
     *
     * Conseil : charger les relations avec ->load() pour éviter les requêtes séparées
     * ---------------------------------------------------------------
     */
    public function me(Request $request)
    {
        // TODO: Récupérer l'utilisateur courant (Admin ou User)
        // $user = $request->user();

        // TODO: Détecter le type et charger les bonnes relations
        // if ($user instanceof Admin) {
        //     return response()->json([
        //         'type'   => 'admin',
        //         'profil' => $user->load('departement'),
        //     ]);
        // }
        // return response()->json([
        //     'type'   => 'student',
        //     'profil' => $user->load('filiere.departement'),
        // ]);
    }
}
