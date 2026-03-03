"""
═══════════════════════════════════════════════════════════════════════════════
TESTS ADMIN LARAVEL
═══════════════════════════════════════════════════════════════════════════════
Couvre TOUTES les routes /api/v1/admin/* :

  GET/POST     /admin/departements
  GET/PUT/DEL  /admin/departements/{id}
  GET          /admin/departements/{id}/stats
  GET/POST     /admin/chefs-departement
  GET/PUT/DEL  /admin/chefs-departement/{id}
  POST         /admin/chefs-departement/{id}/toggle
  GET          /admin/stats/global
  GET          /admin/stats/dashboard
  CRUD         /admin/matieres
  GET          /admin/emploi-temps/filieres/{id}
  CRUD         /admin/notes
  CRUD         /admin/emploi-temps
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
from conftest import LARAVEL_BASE_URL, REQUEST_TIMEOUT, auth_headers


# ═══════════════════════════════════════════════════════════════
# DEPARTEMENTS
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.admin
@pytest.mark.crud
class TestAdminDepartements:
    """Tests CRUD départements (super admin)."""

    def test_list_departements_no_auth(self, laravel_url, check_laravel):
        """GET /admin/departements — sans auth → 401."""
        r = requests.get(f"{laravel_url}/admin/departements", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_list_departements_with_admin(self, laravel_url, admin_token, check_laravel):
        """GET /admin/departements — avec token admin."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/departements",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, (dict, list))

    def test_create_departement_no_auth(self, laravel_url, check_laravel):
        """POST /admin/departements — sans auth → 401."""
        r = requests.post(
            f"{laravel_url}/admin/departements",
            json={"nom": "Test Dept"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]

    def test_create_departement_with_admin(self, laravel_url, admin_token, check_laravel):
        """POST /admin/departements — création avec données valides."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.post(
            f"{laravel_url}/admin/departements",
            json={"nom": "Département Test Unitaire", "description": "Créé par les tests"},
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]

    def test_create_departement_missing_name(self, laravel_url, admin_token, check_laravel):
        """POST /admin/departements — nom manquant → 422."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.post(
            f"{laravel_url}/admin/departements",
            json={},
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400]

    def test_show_departement(self, laravel_url, admin_token, check_laravel):
        """GET /admin/departements/{id} — consulter un département."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/departements/1",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_show_departement_not_found(self, laravel_url, admin_token, check_laravel):
        """GET /admin/departements/99999 — département inexistant."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/departements/99999",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 200]

    def test_update_departement(self, laravel_url, admin_token, check_laravel):
        """PUT /admin/departements/{id} — mise à jour."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.put(
            f"{laravel_url}/admin/departements/1",
            json={"nom": "Département Modifié Test"},
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404, 422]

    def test_delete_departement_nonexistent(self, laravel_url, admin_token, check_laravel):
        """DELETE /admin/departements/99999 — suppression inexistant."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.delete(
            f"{laravel_url}/admin/departements/99999",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 200, 204]

    def test_departement_stats(self, laravel_url, admin_token, check_laravel):
        """GET /admin/departements/{id}/stats — statistiques département."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/departements/1/stats",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]


# ═══════════════════════════════════════════════════════════════
# CHEFS DE DÉPARTEMENT
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.admin
@pytest.mark.crud
class TestAdminChefsDepartement:
    """Tests CRUD chefs de département (super admin)."""

    def test_list_chefs_no_auth(self, laravel_url, check_laravel):
        """GET /admin/chefs-departement — sans auth → 401."""
        r = requests.get(f"{laravel_url}/admin/chefs-departement", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_list_chefs_with_admin(self, laravel_url, admin_token, check_laravel):
        """GET /admin/chefs-departement — liste avec auth admin."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/chefs-departement",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_create_chef_missing_data(self, laravel_url, admin_token, check_laravel):
        """POST /admin/chefs-departement — données manquantes."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.post(
            f"{laravel_url}/admin/chefs-departement",
            json={},
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400]

    def test_create_chef_with_data(self, laravel_url, admin_token, check_laravel):
        """POST /admin/chefs-departement — création avec données."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        import time
        r = requests.post(
            f"{laravel_url}/admin/chefs-departement",
            json={
                "nom": "Chef",
                "prenom": "Test",
                "email": f"chef_test_{int(time.time())}@test.com",
                "password": "password123",
                "password_confirmation": "password123",
                "departement_id": 1
            },
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]

    def test_show_chef(self, laravel_url, admin_token, check_laravel):
        """GET /admin/chefs-departement/{id} — consulter un chef."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/chefs-departement/1",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_update_chef(self, laravel_url, admin_token, check_laravel):
        """PUT /admin/chefs-departement/{id} — mise à jour."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.put(
            f"{laravel_url}/admin/chefs-departement/1",
            json={"nom": "ChefModifié"},
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404, 422]

    def test_delete_chef_nonexistent(self, laravel_url, admin_token, check_laravel):
        """DELETE /admin/chefs-departement/99999 — suppression inexistant."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.delete(
            f"{laravel_url}/admin/chefs-departement/99999",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 200, 204]

    def test_toggle_chef(self, laravel_url, admin_token, check_laravel):
        """POST /admin/chefs-departement/{id}/toggle — activer/désactiver."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.post(
            f"{laravel_url}/admin/chefs-departement/1/toggle",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]


# ═══════════════════════════════════════════════════════════════
# STATISTIQUES GLOBALES
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.admin
class TestAdminStatistiques:
    """Tests des routes statistiques admin."""

    def test_stats_global_no_auth(self, laravel_url, check_laravel):
        """GET /admin/stats/global — sans auth → 401."""
        r = requests.get(f"{laravel_url}/admin/stats/global", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_stats_global_with_admin(self, laravel_url, admin_token, check_laravel):
        """GET /admin/stats/global — avec auth admin."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/stats/global",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_stats_dashboard_no_auth(self, laravel_url, check_laravel):
        """GET /admin/stats/dashboard — sans auth → 401."""
        r = requests.get(f"{laravel_url}/admin/stats/dashboard", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_stats_dashboard_with_admin(self, laravel_url, admin_token, check_laravel):
        """GET /admin/stats/dashboard — avec auth admin."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/stats/dashboard",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200


# ═══════════════════════════════════════════════════════════════
# MATIÈRES (ADMIN)
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.admin
@pytest.mark.crud
class TestAdminMatieres:
    """Tests CRUD matières (super admin)."""

    def test_list_matieres_no_auth(self, laravel_url, check_laravel):
        """GET /admin/matieres — sans auth → 401."""
        r = requests.get(f"{laravel_url}/admin/matieres", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_list_matieres(self, laravel_url, admin_token, check_laravel):
        """GET /admin/matieres — liste avec auth."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/matieres",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_create_matiere(self, laravel_url, admin_token, check_laravel):
        """POST /admin/matieres — création."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.post(
            f"{laravel_url}/admin/matieres",
            json={"nom": "Matière Test", "coefficient": 3, "code": "MAT_TST"},
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]

    def test_show_matiere(self, laravel_url, admin_token, check_laravel):
        """GET /admin/matieres/{id} — consulter."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/matieres/1",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_update_matiere(self, laravel_url, admin_token, check_laravel):
        """PUT /admin/matieres/{id} — mise à jour."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.put(
            f"{laravel_url}/admin/matieres/1",
            json={"nom": "Matière Modifiée"},
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404, 422]

    def test_delete_matiere_nonexistent(self, laravel_url, admin_token, check_laravel):
        """DELETE /admin/matieres/99999 — inexistante."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.delete(
            f"{laravel_url}/admin/matieres/99999",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 200, 204]


# ═══════════════════════════════════════════════════════════════
# EMPLOI DU TEMPS (ADMIN)
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.admin
@pytest.mark.crud
class TestAdminEmploiTemps:
    """Tests emploi du temps admin."""

    def test_emploi_temps_filieres_no_auth(self, laravel_url, check_laravel):
        """GET /admin/emploi-temps/filieres/{id} — sans auth → 401."""
        r = requests.get(f"{laravel_url}/admin/emploi-temps/filieres/1", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_emploi_temps_filieres(self, laravel_url, admin_token, check_laravel):
        """GET /admin/emploi-temps/filieres/{id} — avec auth."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/emploi-temps/filieres/1",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_create_emploi_temps(self, laravel_url, admin_token, check_laravel):
        """POST /admin/emploi-temps — création."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.post(
            f"{laravel_url}/admin/emploi-temps",
            json={
                "filiere_id": 1,
                "matiere_id": 1,
                "jour": "lundi",
                "heure_debut": "08:00",
                "heure_fin": "10:00",
                "salle": "A101"
            },
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]

    def test_show_emploi_temps(self, laravel_url, admin_token, check_laravel):
        """GET /admin/emploi-temps/{id} — consulter."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/emploi-temps/1",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]


# ═══════════════════════════════════════════════════════════════
# NOTES (ADMIN)
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.admin
@pytest.mark.crud
class TestAdminNotes:
    """Tests CRUD notes admin."""

    def test_list_notes_no_auth(self, laravel_url, check_laravel):
        """GET /admin/notes — sans auth → 401."""
        r = requests.get(f"{laravel_url}/admin/notes", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_list_notes(self, laravel_url, admin_token, check_laravel):
        """GET /admin/notes — liste avec auth."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/notes",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_create_note(self, laravel_url, admin_token, check_laravel):
        """POST /admin/notes — création."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.post(
            f"{laravel_url}/admin/notes",
            json={"etudiant_id": 1, "matiere_id": 1, "valeur": 15, "type": "examen"},
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]

    def test_show_note(self, laravel_url, admin_token, check_laravel):
        """GET /admin/notes/{id} — consulter une note."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/admin/notes/1",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]
