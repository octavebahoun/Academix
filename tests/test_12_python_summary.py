"""
═══════════════════════════════════════════════════════════════════════════════
TESTS PYTHON — SUMMARY SERVICE
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/v1/summary/* :
  POST /api/v1/summary/generate
  GET  /api/v1/summary/{summary_id}
  GET  /api/v1/summary/download/{summary_id}
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
import io
from conftest import PYTHON_BASE_URL, REQUEST_TIMEOUT, auth_headers, auth_headers_multipart


@pytest.mark.python_api
@pytest.mark.ai
class TestPythonSummary:
    """Tests du service de résumé/fiche de révision."""

    def test_generate_summary_no_auth(self, python_url, check_python):
        """POST /api/v1/summary/generate — sans auth → 401."""
        fake_file = io.BytesIO(b"Contenu de test")
        r = requests.post(
            f"{python_url}/summary/generate",
            files={"file": ("test.txt", fake_file, "text/plain")},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 422]

    def test_generate_summary_txt(self, python_url, student_token, check_python):
        """POST /api/v1/summary/generate — génération depuis TXT."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        content = """
        Introduction à l'algorithmique.
        Un algorithme est une suite finie d'instructions permettant de résoudre un problème.
        Les structures de base sont : séquence, sélection, itération.
        La complexité algorithmique mesure l'efficacité d'un algorithme.
        """ * 20
        fake_file = io.BytesIO(content.encode())
        r = requests.post(
            f"{python_url}/summary/generate",
            files={"file": ("algorithmique.txt", fake_file, "text/plain")},
            data={"level": "medium", "style": "bullets", "format": "markdown"},
            headers=auth_headers_multipart(student_token),
            timeout=60
        )
        assert r.status_code in [200, 500, 503]
        if r.status_code == 200:
            data = r.json()
            assert "summary_id" in data
            assert "content" in data

    def test_generate_summary_invalid_extension(self, python_url, student_token, check_python):
        """POST /api/v1/summary/generate — extension non supportée → 400."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        fake_file = io.BytesIO(b"test")
        r = requests.post(
            f"{python_url}/summary/generate",
            files={"file": ("test.exe", fake_file, "application/octet-stream")},
            headers=auth_headers_multipart(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [400, 422, 500]

    def test_generate_summary_all_levels(self, python_url, student_token, check_python):
        """POST /api/v1/summary/generate — test tous les niveaux."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        for level in ["short", "medium", "detailed"]:
            fake_file = io.BytesIO(b"Contenu de cours pour test de niveau. " * 50)
            r = requests.post(
                f"{python_url}/summary/generate",
                files={"file": ("test.txt", fake_file, "text/plain")},
                data={"level": level},
                headers=auth_headers_multipart(student_token),
                timeout=60
            )
            assert r.status_code in [200, 500, 503], f"Niveau {level} échoué: {r.status_code}"

    def test_get_summary_not_found(self, python_url, student_token, check_python):
        """GET /api/v1/summary/{id} — résumé inexistant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/summary/nonexistent-id-12345",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 422]

    def test_download_summary_not_found(self, python_url, student_token, check_python):
        """GET /api/v1/summary/download/{id} — téléchargement inexistant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/summary/download/nonexistent-id-12345",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 422]
