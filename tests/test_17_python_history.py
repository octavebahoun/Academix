"""
═══════════════════════════════════════════════════════════════════════════════
TESTS PYTHON — HISTORY SERVICE
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/v1/history/* :
  GET    /api/v1/history
  DELETE /api/v1/history/{history_id}
  DELETE /api/v1/history
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
from conftest import PYTHON_BASE_URL, REQUEST_TIMEOUT, auth_headers


@pytest.mark.python_api
class TestPythonHistory:
    """Tests du service d'historique IA."""

    def test_get_history_no_auth(self, python_url, check_python):
        """GET /api/v1/history — sans auth → 401."""
        r = requests.get(f"{python_url}/history", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403, 422]

    def test_get_history_with_token(self, python_url, student_token, check_python):
        """GET /api/v1/history — historique complet."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/history",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200
        data = r.json()
        assert "total" in data
        assert "items" in data
        assert isinstance(data["items"], list)

    def test_get_history_filter_by_type(self, python_url, student_token, check_python):
        """GET /api/v1/history?type=summary — filtrage par type."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        for stype in ["summary", "quiz", "exercise", "podcast", "image", "chat"]:
            r = requests.get(
                f"{python_url}/history",
                params={"type": stype},
                headers=auth_headers(student_token),
                timeout=REQUEST_TIMEOUT
            )
            assert r.status_code == 200, f"Type {stype} échoué: {r.status_code}"
            data = r.json()
            assert "total" in data

    def test_delete_history_item_not_found(self, python_url, student_token, check_python):
        """DELETE /api/v1/history/{id} — entrée inexistante."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.delete(
            f"{python_url}/history/nonexistent-history-id",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 200]

    def test_delete_history_no_auth(self, python_url, check_python):
        """DELETE /api/v1/history/{id} — sans auth → 401."""
        r = requests.delete(
            f"{python_url}/history/test-id",
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 422]

    def test_clear_history_by_type_no_auth(self, python_url, check_python):
        """DELETE /api/v1/history?type=chat — sans auth → 401."""
        r = requests.delete(
            f"{python_url}/history",
            params={"type": "chat"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 422]

    def test_clear_history_by_type(self, python_url, student_token, check_python):
        """DELETE /api/v1/history?type=chat — suppression par type."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.delete(
            f"{python_url}/history",
            params={"type": "chat"},
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200
        data = r.json()
        assert "deleted" in data or "message" in data

    def test_clear_history_missing_type(self, python_url, student_token, check_python):
        """DELETE /api/v1/history — type manquant → 422."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.delete(
            f"{python_url}/history",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400]
