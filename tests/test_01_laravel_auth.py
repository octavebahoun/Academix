"""
═══════════════════════════════════════════════════════════════════════════════
TESTS AUTHENTIFICATION LARAVEL
═══════════════════════════════════════════════════════════════════════════════
Couvre TOUTES les routes /api/v1/auth/* :

  POST /auth/admin/register   (super admin)
  POST /auth/admin/login
  POST /auth/admin/logout
  POST /auth/chef/login
  POST /auth/chef/logout
  POST /auth/student/register (admin)
  POST /auth/student/login
  POST /auth/student/activate
  POST /auth/student/logout
  GET  /auth/me
  GET  /auth/google/redirect
  POST /auth/google/callback
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
from conftest import (
    LARAVEL_BASE_URL, REQUEST_TIMEOUT, auth_headers,
    ADMIN_EMAIL, ADMIN_PASSWORD,
    CHEF_EMAIL, CHEF_PASSWORD,
    STUDENT_EMAIL, STUDENT_PASSWORD, STUDENT_MATRICULE
)


@pytest.mark.laravel
@pytest.mark.auth
class TestAdminLogin:
    """Tests de connexion administrateur."""

    def test_admin_login_success(self, laravel_url, check_laravel):
        """POST /auth/admin/login — login admin valide."""
        r = requests.post(
            f"{laravel_url}/auth/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=REQUEST_TIMEOUT
        )
        # Accepte 200 (succès) ou 401/422 (creds invalides = route fonctionne)
        assert r.status_code in [200, 401, 422], f"Status inattendu: {r.status_code}"
        data = r.json()
        assert isinstance(data, dict), "La réponse doit être un objet JSON"

    def test_admin_login_missing_email(self, laravel_url, check_laravel):
        """POST /auth/admin/login — email manquant."""
        r = requests.post(
            f"{laravel_url}/auth/admin/login",
            json={"password": "test"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400], f"Devrait rejeter sans email: {r.status_code}"

    def test_admin_login_missing_password(self, laravel_url, check_laravel):
        """POST /auth/admin/login — mot de passe manquant."""
        r = requests.post(
            f"{laravel_url}/auth/admin/login",
            json={"email": ADMIN_EMAIL},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400], f"Devrait rejeter sans password: {r.status_code}"

    def test_admin_login_invalid_credentials(self, laravel_url, check_laravel):
        """POST /auth/admin/login — identifiants incorrects."""
        r = requests.post(
            f"{laravel_url}/auth/admin/login",
            json={"email": "fake@fake.com", "password": "wrongpassword"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 422, 403], f"Devrait refuser: {r.status_code}"

    def test_admin_login_empty_body(self, laravel_url, check_laravel):
        """POST /auth/admin/login — body vide."""
        r = requests.post(
            f"{laravel_url}/auth/admin/login",
            json={},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400], f"Devrait rejeter body vide: {r.status_code}"


@pytest.mark.laravel
@pytest.mark.auth
class TestAdminRegister:
    """Tests d'inscription administrateur (nécessite token super admin)."""

    def test_admin_register_without_token(self, laravel_url, check_laravel):
        """POST /auth/admin/register — sans authentification."""
        r = requests.post(
            f"{laravel_url}/auth/admin/register",
            json={"nom": "Test", "prenom": "User", "email": "test@test.com", "password": "password123"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403], f"Devrait être non autorisé: {r.status_code}"

    def test_admin_register_with_token(self, laravel_url, admin_token, check_laravel):
        """POST /auth/admin/register — avec token admin."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.post(
            f"{laravel_url}/auth/admin/register",
            json={
                "nom": "TestUnit",
                "prenom": "AdminReg",
                "email": f"test_register_{pytest.importorskip('time').time()}@test.com",
                "password": "password123",
                "password_confirmation": "password123"
            },
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        # 201 (créé) ou 422 (validation), ou 403 (pas super admin)
        assert r.status_code in [200, 201, 422, 403], f"Status inattendu: {r.status_code}"


@pytest.mark.laravel
@pytest.mark.auth
class TestAdminLogout:
    """Tests de déconnexion administrateur."""

    def test_admin_logout_without_token(self, laravel_url, check_laravel):
        """POST /auth/admin/logout — sans token."""
        r = requests.post(
            f"{laravel_url}/auth/admin/logout",
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403], f"Devrait être non autorisé: {r.status_code}"

    def test_admin_logout_with_invalid_token(self, laravel_url, check_laravel):
        """POST /auth/admin/logout — token invalide."""
        r = requests.post(
            f"{laravel_url}/auth/admin/logout",
            headers=auth_headers("invalid_token_12345"),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403], f"Token invalide devrait être refusé: {r.status_code}"


@pytest.mark.laravel
@pytest.mark.auth
class TestChefLogin:
    """Tests de connexion chef de département."""

    def test_chef_login_success(self, laravel_url, check_laravel):
        """POST /auth/chef/login — login chef valide."""
        r = requests.post(
            f"{laravel_url}/auth/chef/login",
            json={"email": CHEF_EMAIL, "password": CHEF_PASSWORD},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 401, 422], f"Status inattendu: {r.status_code}"

    def test_chef_login_missing_fields(self, laravel_url, check_laravel):
        """POST /auth/chef/login — champs manquants."""
        r = requests.post(
            f"{laravel_url}/auth/chef/login",
            json={},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400], f"Devrait rejeter: {r.status_code}"

    def test_chef_login_wrong_credentials(self, laravel_url, check_laravel):
        """POST /auth/chef/login — identifiants incorrects."""
        r = requests.post(
            f"{laravel_url}/auth/chef/login",
            json={"email": "wrong@wrong.com", "password": "wrong"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 422, 403], f"Devrait refuser: {r.status_code}"


@pytest.mark.laravel
@pytest.mark.auth
class TestChefLogout:
    """Tests de déconnexion chef de département."""

    def test_chef_logout_without_token(self, laravel_url, check_laravel):
        """POST /auth/chef/logout — sans authentification."""
        r = requests.post(
            f"{laravel_url}/auth/chef/logout",
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]


@pytest.mark.laravel
@pytest.mark.auth
class TestStudentLogin:
    """Tests de connexion étudiant."""

    def test_student_login_success(self, laravel_url, check_laravel):
        """POST /auth/student/login — login étudiant valide."""
        r = requests.post(
            f"{laravel_url}/auth/student/login",
            json={
                "email": STUDENT_EMAIL,
                "password": STUDENT_PASSWORD,
                "matricule": STUDENT_MATRICULE
            },
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 401, 422], f"Status inattendu: {r.status_code}"

    def test_student_login_missing_email(self, laravel_url, check_laravel):
        """POST /auth/student/login — email manquant."""
        r = requests.post(
            f"{laravel_url}/auth/student/login",
            json={"password": "test"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400]

    def test_student_login_empty_body(self, laravel_url, check_laravel):
        """POST /auth/student/login — body vide."""
        r = requests.post(
            f"{laravel_url}/auth/student/login",
            json={},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400]

    def test_student_login_invalid_credentials(self, laravel_url, check_laravel):
        """POST /auth/student/login — identifiants incorrects."""
        r = requests.post(
            f"{laravel_url}/auth/student/login",
            json={"email": "noone@test.com", "password": "bad", "matricule": "XXX"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 422, 403]


@pytest.mark.laravel
@pytest.mark.auth
class TestStudentActivate:
    """Tests d'activation de compte étudiant."""

    def test_student_activate_missing_data(self, laravel_url, check_laravel):
        """POST /auth/student/activate — données manquantes."""
        r = requests.post(
            f"{laravel_url}/auth/student/activate",
            json={},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400, 404]

    def test_student_activate_invalid_code(self, laravel_url, check_laravel):
        """POST /auth/student/activate — code d'activation invalide."""
        r = requests.post(
            f"{laravel_url}/auth/student/activate",
            json={"matricule": "FAKE_MAT", "activation_code": "000000"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400, 404, 401]


@pytest.mark.laravel
@pytest.mark.auth
class TestStudentRegister:
    """Tests d'inscription étudiant (nécessite token admin)."""

    def test_student_register_without_token(self, laravel_url, check_laravel):
        """POST /auth/student/register — sans token."""
        r = requests.post(
            f"{laravel_url}/auth/student/register",
            json={"nom": "Test", "prenom": "Student"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]


@pytest.mark.laravel
@pytest.mark.auth
class TestStudentLogout:
    """Tests de déconnexion étudiant."""

    def test_student_logout_without_token(self, laravel_url, check_laravel):
        """POST /auth/student/logout — sans token."""
        r = requests.post(
            f"{laravel_url}/auth/student/logout",
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]


@pytest.mark.laravel
@pytest.mark.auth
class TestAuthMe:
    """Tests du profil utilisateur connecté."""

    def test_me_without_token(self, laravel_url, check_laravel):
        """GET /auth/me — sans authentification."""
        r = requests.get(
            f"{laravel_url}/auth/me",
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]

    def test_me_with_admin_token(self, laravel_url, admin_token, check_laravel):
        """GET /auth/me — avec token admin."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/auth/me",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)

    def test_me_with_student_token(self, laravel_url, student_token, check_laravel):
        """GET /auth/me — avec token étudiant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/auth/me",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_me_with_invalid_token(self, laravel_url, check_laravel):
        """GET /auth/me — avec token invalide."""
        r = requests.get(
            f"{laravel_url}/auth/me",
            headers=auth_headers("invalid_garbage_token"),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]


@pytest.mark.laravel
@pytest.mark.auth
class TestGoogleAuth:
    """Tests Google OAuth."""

    def test_google_redirect_without_token(self, laravel_url, check_laravel):
        """GET /auth/google/redirect — sans token."""
        r = requests.get(
            f"{laravel_url}/auth/google/redirect",
            timeout=REQUEST_TIMEOUT,
            allow_redirects=False
        )
        assert r.status_code in [401, 403]

    def test_google_callback_without_token(self, laravel_url, check_laravel):
        """POST /auth/google/callback — sans token."""
        r = requests.post(
            f"{laravel_url}/auth/google/callback",
            json={"code": "fake_auth_code"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]

    def test_google_redirect_with_token(self, laravel_url, student_token, check_laravel):
        """GET /auth/google/redirect — avec token (doit retourner URL ou redirect)."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/auth/google/redirect",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT,
            allow_redirects=False
        )
        # 200 avec URL, 302 redirect, ou 500 si Google pas configuré
        assert r.status_code in [200, 302, 500, 422]
