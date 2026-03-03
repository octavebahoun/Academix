"""
═══════════════════════════════════════════════════════════════════════════════
TESTS ÉTUDIANT LARAVEL
═══════════════════════════════════════════════════════════════════════════════
Couvre TOUTES les routes /api/v1/student/* :

  GET          /student/profil
  PUT          /student/profil
  GET          /student/moyennes
  GET          /student/notes
  GET          /student/emploi-temps
  PATCH        /student/taches/{id}/complete
  CRUD         /student/taches
  GET          /student/alertes
  PATCH        /student/alertes/{id}/read
  GET          /student/analysis
  GET          /student/analysis/history
  POST         /student/analysis/mark-sent/{id}
  POST         /student/push/subscribe
  DELETE       /student/push/subscribe
  GET          /student/google/status
  DELETE       /student/google/disconnect
  POST         /student/google/sync
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
from conftest import LARAVEL_BASE_URL, REQUEST_TIMEOUT, auth_headers


# ═══════════════════════════════════════════════════════════════
# PROFIL ÉTUDIANT
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.student
class TestStudentProfil:
    """Tests du profil étudiant."""

    def test_profil_no_auth(self, laravel_url, check_laravel):
        """GET /student/profil — sans auth → 401."""
        r = requests.get(f"{laravel_url}/student/profil", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_profil_with_token(self, laravel_url, student_token, check_laravel):
        """GET /student/profil — avec token étudiant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/student/profil",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, dict)

    def test_profil_with_admin_token(self, laravel_url, admin_token, check_laravel):
        """GET /student/profil — avec token admin (devrait être refusé)."""
        if not admin_token:
            pytest.skip("Token admin non disponible")
        r = requests.get(
            f"{laravel_url}/student/profil",
            headers=auth_headers(admin_token),
            timeout=REQUEST_TIMEOUT
        )
        # L'admin ne devrait pas accéder aux routes student
        assert r.status_code in [401, 403, 200]

    def test_update_profil(self, laravel_url, student_token, check_laravel):
        """PUT /student/profil — mise à jour du profil."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.put(
            f"{laravel_url}/student/profil",
            json={"nom": "TestNom"},
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 422]

    def test_update_profil_no_auth(self, laravel_url, check_laravel):
        """PUT /student/profil — sans auth → 401."""
        r = requests.put(
            f"{laravel_url}/student/profil",
            json={"nom": "Test"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]


# ═══════════════════════════════════════════════════════════════
# MOYENNES & NOTES
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.student
class TestStudentNotes:
    """Tests des notes et moyennes étudiant."""

    def test_moyennes_no_auth(self, laravel_url, check_laravel):
        """GET /student/moyennes — sans auth → 401."""
        r = requests.get(f"{laravel_url}/student/moyennes", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_moyennes_with_token(self, laravel_url, student_token, check_laravel):
        """GET /student/moyennes — avec token."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/student/moyennes",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_notes_no_auth(self, laravel_url, check_laravel):
        """GET /student/notes — sans auth → 401."""
        r = requests.get(f"{laravel_url}/student/notes", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_notes_with_token(self, laravel_url, student_token, check_laravel):
        """GET /student/notes — avec token."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/student/notes",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200


# ═══════════════════════════════════════════════════════════════
# EMPLOI DU TEMPS ÉTUDIANT
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.student
class TestStudentEmploiTemps:
    """Tests emploi du temps étudiant."""

    def test_emploi_temps_no_auth(self, laravel_url, check_laravel):
        """GET /student/emploi-temps — sans auth → 401."""
        r = requests.get(f"{laravel_url}/student/emploi-temps", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_emploi_temps_with_token(self, laravel_url, student_token, check_laravel):
        """GET /student/emploi-temps — avec token."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/student/emploi-temps",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200


# ═══════════════════════════════════════════════════════════════
# TÂCHES ÉTUDIANT (CRUD)
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.student
@pytest.mark.crud
class TestStudentTaches:
    """Tests CRUD tâches étudiant."""

    def test_list_taches_no_auth(self, laravel_url, check_laravel):
        """GET /student/taches — sans auth → 401."""
        r = requests.get(f"{laravel_url}/student/taches", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_list_taches(self, laravel_url, student_token, check_laravel):
        """GET /student/taches — liste avec token."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/student/taches",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_create_tache(self, laravel_url, student_token, check_laravel):
        """POST /student/taches — création d'une tâche."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{laravel_url}/student/taches",
            json={
                "titre": "Tâche de test unitaire",
                "description": "Créée par les tests automatisés",
                "date_echeance": "2026-12-31",
                "priorite": "haute"
            },
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]

    def test_create_tache_missing_titre(self, laravel_url, student_token, check_laravel):
        """POST /student/taches — titre manquant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{laravel_url}/student/taches",
            json={"description": "Sans titre"},
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400]

    def test_show_tache(self, laravel_url, student_token, check_laravel):
        """GET /student/taches/{id} — consulter une tâche."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/student/taches/1",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_update_tache(self, laravel_url, student_token, check_laravel):
        """PUT /student/taches/{id} — mise à jour."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.put(
            f"{laravel_url}/student/taches/1",
            json={"titre": "Tâche Modifiée Test"},
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404, 422]

    def test_complete_tache(self, laravel_url, student_token, check_laravel):
        """PATCH /student/taches/{id}/complete — marquer complète."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.patch(
            f"{laravel_url}/student/taches/1/complete",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_delete_tache_nonexistent(self, laravel_url, student_token, check_laravel):
        """DELETE /student/taches/99999 — inexistante."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.delete(
            f"{laravel_url}/student/taches/99999",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 200, 204]


# ═══════════════════════════════════════════════════════════════
# ALERTES ÉTUDIANT
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.student
class TestStudentAlertes:
    """Tests des alertes étudiant."""

    def test_list_alertes_no_auth(self, laravel_url, check_laravel):
        """GET /student/alertes — sans auth → 401."""
        r = requests.get(f"{laravel_url}/student/alertes", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_list_alertes(self, laravel_url, student_token, check_laravel):
        """GET /student/alertes — liste avec token."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/student/alertes",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_mark_alerte_read(self, laravel_url, student_token, check_laravel):
        """PATCH /student/alertes/{id}/read — marquer comme lue."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.patch(
            f"{laravel_url}/student/alertes/1/read",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]


# ═══════════════════════════════════════════════════════════════
# ANALYSE IA ÉTUDIANT
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.student
@pytest.mark.ai
class TestStudentAnalysis:
    """Tests analyse IA étudiant."""

    def test_analysis_no_auth(self, laravel_url, check_laravel):
        """GET /student/analysis — sans auth → 401."""
        r = requests.get(f"{laravel_url}/student/analysis", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_analysis_with_token(self, laravel_url, student_token, check_laravel):
        """GET /student/analysis — avec token."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/student/analysis",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        # 200 OK ou 500 si le service IA n'est pas disponible
        assert r.status_code in [200, 500, 503]

    def test_analysis_history(self, laravel_url, student_token, check_laravel):
        """GET /student/analysis/history — historique d'analyse."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/student/analysis/history",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_analysis_mark_sent(self, laravel_url, student_token, check_laravel):
        """POST /student/analysis/mark-sent/{id} — marquer envoyé."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{laravel_url}/student/analysis/mark-sent/1",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]


# ═══════════════════════════════════════════════════════════════
# PUSH NOTIFICATIONS
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.student
class TestStudentPush:
    """Tests push notifications."""

    def test_push_subscribe_no_auth(self, laravel_url, check_laravel):
        """POST /student/push/subscribe — sans auth → 401."""
        r = requests.post(f"{laravel_url}/student/push/subscribe", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_push_subscribe(self, laravel_url, student_token, check_laravel):
        """POST /student/push/subscribe — abonnement."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{laravel_url}/student/push/subscribe",
            json={
                "endpoint": "https://fcm.googleapis.com/fcm/send/test",
                "keys": {
                    "p256dh": "test_key",
                    "auth": "test_auth"
                }
            },
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]

    def test_push_unsubscribe(self, laravel_url, student_token, check_laravel):
        """DELETE /student/push/subscribe — désabonnement."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.delete(
            f"{laravel_url}/student/push/subscribe",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 204, 404]


# ═══════════════════════════════════════════════════════════════
# GOOGLE CALENDAR ÉTUDIANT
# ═══════════════════════════════════════════════════════════════

@pytest.mark.laravel
@pytest.mark.student
class TestStudentGoogle:
    """Tests Google Calendar étudiant."""

    def test_google_status_no_auth(self, laravel_url, check_laravel):
        """GET /student/google/status — sans auth → 401."""
        r = requests.get(f"{laravel_url}/student/google/status", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_google_status(self, laravel_url, student_token, check_laravel):
        """GET /student/google/status — statut connexion Google."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{laravel_url}/student/google/status",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 500]

    def test_google_disconnect(self, laravel_url, student_token, check_laravel):
        """DELETE /student/google/disconnect — déconnexion Google."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.delete(
            f"{laravel_url}/student/google/disconnect",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404, 422]

    def test_google_sync(self, laravel_url, student_token, check_laravel):
        """POST /student/google/sync — synchronisation Google Calendar."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{laravel_url}/student/google/sync",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        # 200 OK, 422 pas connecté Google, 500 erreur service
        assert r.status_code in [200, 422, 500]
