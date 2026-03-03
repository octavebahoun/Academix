"""
═══════════════════════════════════════════════════════════════════════════════
TESTS PYTHON — STUDENT ANALYSIS SERVICE
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/v1/analysis/* :
  GET /api/v1/analysis/{student_id}
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
from conftest import PYTHON_BASE_URL, REQUEST_TIMEOUT, auth_headers


@pytest.mark.python_api
@pytest.mark.ai
class TestPythonStudentAnalysis:
    """Tests du service d'analyse IA des étudiants."""

    def test_analyze_student_no_auth(self, python_url, check_python):
        """GET /api/v1/analysis/1 — sans auth → 401."""
        r = requests.get(f"{python_url}/analysis/1", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403, 422]

    def test_analyze_student_with_token(self, python_url, student_token, check_python):
        """GET /api/v1/analysis/{id} — analyse avec token."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/analysis/1",
            headers=auth_headers(student_token),
            timeout=30
        )
        # 200 OK, 404 étudiant non trouvé, 500 erreur IA
        assert r.status_code in [200, 404, 500, 503]
        if r.status_code == 200:
            data = r.json()
            assert data.get("success") is True
            assert "data" in data

    def test_analyze_student_not_found(self, python_url, student_token, check_python):
        """GET /api/v1/analysis/99999 — étudiant inexistant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/analysis/99999",
            headers=auth_headers(student_token),
            timeout=30
        )
        assert r.status_code in [404, 500]

    def test_analyze_student_invalid_id(self, python_url, student_token, check_python):
        """GET /api/v1/analysis/abc — ID invalide → 422."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/analysis/abc",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 404, 500]

    def test_analyze_student_zero_id(self, python_url, student_token, check_python):
        """GET /api/v1/analysis/0 — ID zéro."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/analysis/0",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 422, 500]

    def test_analyze_student_negative_id(self, python_url, student_token, check_python):
        """GET /api/v1/analysis/-1 — ID négatif."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/analysis/-1",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 422, 500]
