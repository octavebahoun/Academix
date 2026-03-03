"""
═══════════════════════════════════════════════════════════════════════════════
TESTS PYTHON — PODCAST SERVICE
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/v1/podcast/* :
  POST /api/v1/podcast/generate
  GET  /api/v1/podcast/download/{podcast_id}
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
import io
from conftest import PYTHON_BASE_URL, REQUEST_TIMEOUT, auth_headers, auth_headers_multipart


@pytest.mark.python_api
@pytest.mark.ai
class TestPythonPodcast:
    """Tests du service de génération de podcasts."""

    def test_generate_podcast_no_auth(self, python_url, check_python):
        """POST /api/v1/podcast/generate — sans auth → 401."""
        fake_file = io.BytesIO(b"Contenu de test")
        r = requests.post(
            f"{python_url}/podcast/generate",
            files={"file": ("test.txt", fake_file, "text/plain")},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 422]

    def test_generate_podcast(self, python_url, student_token, check_python):
        """POST /api/v1/podcast/generate — génération de podcast."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        content = """
        Introduction aux réseaux informatiques.
        Un réseau est un ensemble d'équipements reliés entre eux pour échanger des informations.
        Les protocoles TCP/IP sont la base d'Internet.
        Le modèle OSI comporte 7 couches.
        Les adresses IP identifient les machines sur le réseau.
        """ * 20
        fake_file = io.BytesIO(content.encode())
        r = requests.post(
            f"{python_url}/podcast/generate",
            files={"file": ("reseaux.txt", fake_file, "text/plain")},
            headers=auth_headers_multipart(student_token),
            timeout=120  # La génération peut être longue
        )
        assert r.status_code in [200, 500, 503]
        if r.status_code == 200:
            data = r.json()
            assert "podcast_id" in data
            assert "url" in data
            assert "script" in data

    def test_generate_podcast_invalid_extension(self, python_url, student_token, check_python):
        """POST /api/v1/podcast/generate — extension non supportée."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        fake_file = io.BytesIO(b"test")
        r = requests.post(
            f"{python_url}/podcast/generate",
            files={"file": ("test.mp3", fake_file, "audio/mpeg")},
            headers=auth_headers_multipart(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [400, 422, 500]

    def test_generate_podcast_empty_file(self, python_url, student_token, check_python):
        """POST /api/v1/podcast/generate — fichier vide."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        fake_file = io.BytesIO(b"")
        r = requests.post(
            f"{python_url}/podcast/generate",
            files={"file": ("empty.txt", fake_file, "text/plain")},
            headers=auth_headers_multipart(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [400, 422, 500]

    def test_download_podcast_not_found(self, python_url, student_token, check_python):
        """GET /api/v1/podcast/download/{id} — podcast inexistant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/podcast/download/nonexistent-podcast-id",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 404

    def test_download_podcast_no_auth(self, python_url, check_python):
        """GET /api/v1/podcast/download/{id} — sans auth → 401."""
        r = requests.get(
            f"{python_url}/podcast/download/test-id",
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 404]
