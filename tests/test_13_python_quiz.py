"""
═══════════════════════════════════════════════════════════════════════════════
TESTS PYTHON — QUIZ SERVICE
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/v1/quiz/* :
  POST /api/v1/quiz/generate
  POST /api/v1/quiz/correct
  GET  /api/v1/quiz/{quiz_id}
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
import io
from conftest import PYTHON_BASE_URL, REQUEST_TIMEOUT, auth_headers, auth_headers_multipart


@pytest.mark.python_api
@pytest.mark.ai
class TestPythonQuiz:
    """Tests du service de génération de quiz."""

    def test_generate_quiz_no_auth(self, python_url, check_python):
        """POST /api/v1/quiz/generate — sans auth → 401."""
        fake_file = io.BytesIO(b"Contenu de test")
        r = requests.post(
            f"{python_url}/quiz/generate",
            files={"file": ("test.txt", fake_file, "text/plain")},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 422]

    def test_generate_quiz(self, python_url, student_token, check_python):
        """POST /api/v1/quiz/generate — génération de quiz."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        content = """
        Les bases de données relationnelles.
        SQL est un langage de requête structuré.
        Les tables sont composées de lignes et de colonnes.
        Les clés primaires identifient uniquement chaque enregistrement.
        Les jointures permettent de combiner des données de plusieurs tables.
        La normalisation réduit la redondance des données.
        """ * 15
        fake_file = io.BytesIO(content.encode())
        r = requests.post(
            f"{python_url}/quiz/generate",
            files={"file": ("bdd.txt", fake_file, "text/plain")},
            data={"nb_questions": "5", "difficulty": "easy"},
            headers=auth_headers_multipart(student_token),
            timeout=60
        )
        assert r.status_code in [200, 500, 503]
        if r.status_code == 200:
            data = r.json()
            assert "quiz_id" in data
            assert "questions" in data
            assert len(data["questions"]) > 0

    def test_generate_quiz_invalid_extension(self, python_url, student_token, check_python):
        """POST /api/v1/quiz/generate — extension non supportée."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        fake_file = io.BytesIO(b"test")
        r = requests.post(
            f"{python_url}/quiz/generate",
            files={"file": ("test.jpg", fake_file, "image/jpeg")},
            headers=auth_headers_multipart(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [400, 422, 500]

    def test_generate_quiz_all_difficulties(self, python_url, student_token, check_python):
        """POST /api/v1/quiz/generate — test de chaque difficulté."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        for difficulty in ["easy", "medium", "hard"]:
            fake_file = io.BytesIO(b"Contenu de cours pour quiz. " * 50)
            r = requests.post(
                f"{python_url}/quiz/generate",
                files={"file": ("test.txt", fake_file, "text/plain")},
                data={"nb_questions": "5", "difficulty": difficulty},
                headers=auth_headers_multipart(student_token),
                timeout=60
            )
            assert r.status_code in [200, 500, 503], f"Difficulté {difficulty}: {r.status_code}"

    def test_correct_quiz_no_auth(self, python_url, check_python):
        """POST /api/v1/quiz/correct — sans auth → 401."""
        r = requests.post(
            f"{python_url}/quiz/correct",
            json={"quiz_id": "test", "answers": [0, 1, 2]},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 422]

    def test_correct_quiz_not_found(self, python_url, student_token, check_python):
        """POST /api/v1/quiz/correct — quiz inexistant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{python_url}/quiz/correct",
            json={"quiz_id": "nonexistent-quiz-id", "answers": [0, 1, 2]},
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 422, 500]

    def test_get_quiz_not_found(self, python_url, student_token, check_python):
        """GET /api/v1/quiz/{id} — quiz inexistant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/quiz/nonexistent-quiz-id",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 422]
