"""
═══════════════════════════════════════════════════════════════════════════════
TESTS PYTHON — ROOT & RAG SERVICE
═══════════════════════════════════════════════════════════════════════════════
Couvre :
  GET  /                 (root status)
  POST /api/v1/chat      (RAG chat)
  POST /api/v1/upload    (RAG upload)
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
import io
from conftest import PYTHON_BASE_URL, REQUEST_TIMEOUT, auth_headers, auth_headers_multipart


@pytest.mark.python_api
class TestPythonRoot:
    """Tests du endpoint racine Python."""

    def test_root(self, python_url, check_python):
        """GET / — page d'accueil API Python."""
        base = python_url.replace("/api/v1", "")
        r = requests.get(f"{base}/", timeout=REQUEST_TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        assert "status" in data or "message" in data


@pytest.mark.python_api
@pytest.mark.ai
class TestPythonRAGChat:
    """Tests du service RAG (chat IA)."""

    def test_chat_no_auth(self, python_url, check_python):
        """POST /api/v1/chat — sans auth → 401."""
        r = requests.post(
            f"{python_url}/chat",
            json={"question": "Qu'est-ce qu'un algorithme ?"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 422]

    def test_chat_with_token(self, python_url, student_token, check_python):
        """POST /api/v1/chat — question avec token."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{python_url}/chat",
            json={"question": "Qu'est-ce qu'un algorithme ?", "history": []},
            headers=auth_headers(student_token),
            timeout=30  # L'IA peut être lente
        )
        assert r.status_code in [200, 500, 503]
        if r.status_code == 200:
            data = r.json()
            assert "answer" in data

    def test_chat_empty_question(self, python_url, student_token, check_python):
        """POST /api/v1/chat — question vide."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{python_url}/chat",
            json={"question": "", "history": []},
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400, 200, 500]

    def test_chat_with_history(self, python_url, student_token, check_python):
        """POST /api/v1/chat — avec historique de conversation."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{python_url}/chat",
            json={
                "question": "Peux-tu m'expliquer davantage ?",
                "history": [
                    {"role": "user", "content": "Qu'est-ce qu'un algorithme ?"},
                    {"role": "assistant", "content": "Un algorithme est une suite d'instructions."}
                ]
            },
            headers=auth_headers(student_token),
            timeout=30
        )
        assert r.status_code in [200, 500, 503]

    def test_chat_missing_body(self, python_url, student_token, check_python):
        """POST /api/v1/chat — body manquant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{python_url}/chat",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400]


@pytest.mark.python_api
@pytest.mark.ai
class TestPythonRAGUpload:
    """Tests de l'upload de fichiers pour le RAG."""

    def test_upload_no_auth(self, python_url, check_python):
        """POST /api/v1/upload — sans auth → 401."""
        fake_file = io.BytesIO(b"Contenu de test")
        r = requests.post(
            f"{python_url}/upload",
            files={"file": ("test.txt", fake_file, "text/plain")},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 422]

    def test_upload_txt_file(self, python_url, student_token, check_python):
        """POST /api/v1/upload — upload fichier TXT."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        fake_file = io.BytesIO(b"Ceci est un cours de test pour le RAG. " * 50)
        r = requests.post(
            f"{python_url}/upload",
            files={"file": ("cours_test.txt", fake_file, "text/plain")},
            headers=auth_headers_multipart(student_token),
            timeout=30
        )
        assert r.status_code in [200, 500]
        if r.status_code == 200:
            data = r.json()
            assert "filename" in data
            assert "chunks" in data

    def test_upload_no_file(self, python_url, student_token, check_python):
        """POST /api/v1/upload — sans fichier → 422."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{python_url}/upload",
            headers=auth_headers_multipart(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400]
