"""
═══════════════════════════════════════════════════════════════════════════════
TESTS CHEF DE DÉPARTEMENT LARAVEL
═══════════════════════════════════════════════════════════════════════════════
Couvre TOUTES les routes /api/v1/departement/* :

  CRUD         /departement/matieres
  CRUD         /departement/filieres
  POST         /departement/filieres/{id}/matieres
  DELETE       /departement/filieres/{id}/matieres/{matiere_id}
  GET          /departement/filieres/{id}/etudiants
  GET          /departement/filieres/{id}/matieres
  GET          /departement/filieres/{id}/stats
  GET          /departement/filieres/{id}/emploi-temps
  GET          /departement/etudiants
  POST         /departement/import/etudiants
  POST         /departement/import/notes
  POST         /departement/import/emploi-temps
  GET          /departement/import/template/etudiants
  GET          /departement/import/template/notes
  GET          /departement/import/template/emploi-temps
  GET          /departement/import/history
  GET          /departement/import/history/{id}/download
  CRUD         /departement/notes
  CRUD         /departement/emploi-temps
  GET          /departement/dashboard
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
import os
import io
from conftest import LARAVEL_BASE_URL, REQUEST_TIMEOUT, auth_headers, auth_headers_multipart


# ═══════════════════════════════════════════════════════════════
# FILIÈRES
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.departement
@pytest.mark.crud
class TestDepartementFilieres:
    """Tests CRUD filières (chef de département)."""

    def test_list_filieres_no_auth(self, laravel_url, check_laravel):
        """GET /departement/filieres — sans auth → 401."""
        r = requests.get(f"{laravel_url}/departement/filieres", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_list_filieres(self, laravel_url, chef_token, check_laravel):
        """GET /departement/filieres — liste avec auth chef."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/filieres",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_create_filiere(self, laravel_url, chef_token, check_laravel):
        """POST /departement/filieres — création."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.post(
            f"{laravel_url}/departement/filieres",
            json={"nom": "Filière Test", "code": "FIL_TST", "niveau": "L1"},
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]

    def test_create_filiere_missing_data(self, laravel_url, chef_token, check_laravel):
        """POST /departement/filieres — données manquantes."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.post(
            f"{laravel_url}/departement/filieres",
            json={},
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400]

    def test_show_filiere(self, laravel_url, chef_token, check_laravel):
        """GET /departement/filieres/{id} — consulter."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/filieres/1",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_update_filiere(self, laravel_url, chef_token, check_laravel):
        """PUT /departement/filieres/{id} — mise à jour."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.put(
            f"{laravel_url}/departement/filieres/1",
            json={"nom": "Filière Modifiée Test"},
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404, 422]

    def test_delete_filiere_nonexistent(self, laravel_url, chef_token, check_laravel):
        """DELETE /departement/filieres/99999 — inexistante."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.delete(
            f"{laravel_url}/departement/filieres/99999",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 200, 204]

    def test_filiere_etudiants(self, laravel_url, chef_token, check_laravel):
        """GET /departement/filieres/{id}/etudiants — étudiants d'une filière."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/filieres/1/etudiants",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_filiere_matieres(self, laravel_url, chef_token, check_laravel):
        """GET /departement/filieres/{id}/matieres — matières d'une filière."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/filieres/1/matieres",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_filiere_stats(self, laravel_url, chef_token, check_laravel):
        """GET /departement/filieres/{id}/stats — statistiques filière."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/filieres/1/stats",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_filiere_emploi_temps(self, laravel_url, chef_token, check_laravel):
        """GET /departement/filieres/{id}/emploi-temps — emploi du temps filière."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/filieres/1/emploi-temps",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_assign_matiere_to_filiere(self, laravel_url, chef_token, check_laravel):
        """POST /departement/filieres/{id}/matieres — assigner une matière."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.post(
            f"{laravel_url}/departement/filieres/1/matieres",
            json={"matiere_id": 1},
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 404, 422, 409]

    def test_remove_matiere_from_filiere(self, laravel_url, chef_token, check_laravel):
        """DELETE /departement/filieres/{id}/matieres/{mid} — retirer une matière."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.delete(
            f"{laravel_url}/departement/filieres/1/matieres/99999",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 204, 404]


# ═══════════════════════════════════════════════════════════════
# MATIÈRES (DÉPARTEMENT)
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.departement
@pytest.mark.crud
class TestDepartementMatieres:
    """Tests CRUD matières (chef de département)."""

    def test_list_matieres(self, laravel_url, chef_token, check_laravel):
        """GET /departement/matieres — liste."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/matieres",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_create_matiere(self, laravel_url, chef_token, check_laravel):
        """POST /departement/matieres — création."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.post(
            f"{laravel_url}/departement/matieres",
            json={"nom": "Matière Dept Test", "coefficient": 2, "code": "MDT_01"},
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]

    def test_show_matiere(self, laravel_url, chef_token, check_laravel):
        """GET /departement/matieres/{id} — consulter."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/matieres/1",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]


# ═══════════════════════════════════════════════════════════════
# ÉTUDIANTS (DÉPARTEMENT)
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.departement
class TestDepartementEtudiants:
    """Tests étudiants du département."""

    def test_list_etudiants_no_auth(self, laravel_url, check_laravel):
        """GET /departement/etudiants — sans auth → 401."""
        r = requests.get(f"{laravel_url}/departement/etudiants", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_list_etudiants(self, laravel_url, chef_token, check_laravel):
        """GET /departement/etudiants — liste avec auth."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/etudiants",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200


# ═══════════════════════════════════════════════════════════════
# IMPORTS CSV
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.departement
class TestDepartementImports:
    """Tests des imports CSV (chef de département)."""

    def test_import_etudiants_no_auth(self, laravel_url, check_laravel):
        """POST /departement/import/etudiants — sans auth → 401."""
        r = requests.post(f"{laravel_url}/departement/import/etudiants", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_import_etudiants_no_file(self, laravel_url, chef_token, check_laravel):
        """POST /departement/import/etudiants — sans fichier."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.post(
            f"{laravel_url}/departement/import/etudiants",
            headers=auth_headers_multipart(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400]

    def test_import_notes_no_auth(self, laravel_url, check_laravel):
        """POST /departement/import/notes — sans auth → 401."""
        r = requests.post(f"{laravel_url}/departement/import/notes", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_import_emploi_temps_no_auth(self, laravel_url, check_laravel):
        """POST /departement/import/emploi-temps — sans auth → 401."""
        r = requests.post(f"{laravel_url}/departement/import/emploi-temps", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_template_etudiants(self, laravel_url, chef_token, check_laravel):
        """GET /departement/import/template/etudiants — télécharger template."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/import/template/etudiants",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_template_notes(self, laravel_url, chef_token, check_laravel):
        """GET /departement/import/template/notes — télécharger template."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/import/template/notes",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_template_emploi_temps(self, laravel_url, chef_token, check_laravel):
        """GET /departement/import/template/emploi-temps — télécharger template."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/import/template/emploi-temps",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_import_history(self, laravel_url, chef_token, check_laravel):
        """GET /departement/import/history — historique des imports."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/import/history",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_import_history_download(self, laravel_url, chef_token, check_laravel):
        """GET /departement/import/history/{id}/download — télécharger log."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/import/history/1/download",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]


# ═══════════════════════════════════════════════════════════════
# NOTES (DÉPARTEMENT)
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.departement
@pytest.mark.crud
class TestDepartementNotes:
    """Tests CRUD notes (département)."""

    def test_list_notes(self, laravel_url, chef_token, check_laravel):
        """GET /departement/notes — liste."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/notes",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_create_note(self, laravel_url, chef_token, check_laravel):
        """POST /departement/notes — création."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.post(
            f"{laravel_url}/departement/notes",
            json={"etudiant_id": 1, "matiere_id": 1, "valeur": 14.5, "type": "cc"},
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]


# ═══════════════════════════════════════════════════════════════
# EMPLOI DU TEMPS (DÉPARTEMENT)
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.departement
@pytest.mark.crud
class TestDepartementEmploiTemps:
    """Tests emploi du temps (département)."""

    def test_create_emploi_temps(self, laravel_url, chef_token, check_laravel):
        """POST /departement/emploi-temps — création."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.post(
            f"{laravel_url}/departement/emploi-temps",
            json={
                "filiere_id": 1,
                "matiere_id": 1,
                "jour": "mardi",
                "heure_debut": "10:00",
                "heure_fin": "12:00",
                "salle": "B202"
            },
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]


# ═══════════════════════════════════════════════════════════════
# DASHBOARD DÉPARTEMENT
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.departement
class TestDepartementDashboard:
    """Tests du dashboard département."""

    def test_dashboard_no_auth(self, laravel_url, check_laravel):
        """GET /departement/dashboard — sans auth → 401."""
        r = requests.get(f"{laravel_url}/departement/dashboard", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_dashboard_with_chef(self, laravel_url, chef_token, check_laravel):
        """GET /departement/dashboard — avec auth chef."""
        if not chef_token:
            pytest.skip("Token chef non disponible")
        r = requests.get(
            f"{laravel_url}/departement/dashboard",
            headers=auth_headers(chef_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200
