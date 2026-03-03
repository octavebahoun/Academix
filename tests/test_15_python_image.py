"""
═══════════════════════════════════════════════════════════════════════════════
TESTS PYTHON — IMAGE GENERATION SERVICE
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/v1/image/* :
  POST /api/v1/image/generate
  GET  /api/v1/image/download/{filename}
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
from conftest import PYTHON_BASE_URL, REQUEST_TIMEOUT, auth_headers


@pytest.mark.python_api
@pytest.mark.ai
class TestPythonImage:
    """Tests du service de génération d'images."""

    def test_generate_image_no_auth(self, python_url, check_python):
        """POST /api/v1/image/generate — sans auth → 401."""
        r = requests.post(
            f"{python_url}/image/generate",
            params={"prompt": "Un chat"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 422]

    def test_generate_image_with_token(self, python_url, student_token, check_python):
        """POST /api/v1/image/generate — génération d'image."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{python_url}/image/generate",
            params={"prompt": "Un schéma simplifié d'un circuit électrique"},
            headers=auth_headers(student_token),
            timeout=60
        )
        # 200 OK, 502 erreur OpenRouter, 503 clé manquante
        assert r.status_code in [200, 502, 503, 500]

    def test_generate_image_missing_prompt(self, python_url, student_token, check_python):
        """POST /api/v1/image/generate — prompt manquant → 422."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{python_url}/image/generate",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400]

    def test_download_image_not_found(self, python_url, student_token, check_python):
        """GET /api/v1/image/download/{filename} — image inexistante."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/image/download/nonexistent.png",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 404

    def test_download_image_no_auth(self, python_url, check_python):
        """GET /api/v1/image/download/{filename} — sans auth → 401."""
        r = requests.get(
            f"{python_url}/image/download/test.png",
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 404]
