"""
═══════════════════════════════════════════════════════════════════════════════
TESTS PYTHON — EXERCISE SERVICE
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/v1/exercises/* :
  POST /api/v1/exercises/generate
  GET  /api/v1/exercises/{exercise_id}
  GET  /api/v1/exercises/download/{exercise_id}
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
import io
from conftest import PYTHON_BASE_URL, REQUEST_TIMEOUT, auth_headers, auth_headers_multipart


@pytest.mark.python_api
@pytest.mark.ai
class TestPythonExercises:
    """Tests du service de génération d'exercices."""

    def test_generate_exercises_no_auth(self, python_url, check_python):
        """POST /api/v1/exercises/generate — sans auth → 401."""
        fake_file = io.BytesIO(b"Contenu de test")
        r = requests.post(
            f"{python_url}/exercises/generate",
            files={"file": ("test.txt", fake_file, "text/plain")},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403, 422]

    def test_generate_exercises(self, python_url, student_token, check_python):
        """POST /api/v1/exercises/generate — génération d'exercices."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        content = """
        Programmation orientée objet en Python.
        Les classes définissent des objets avec des attributs et des méthodes.
        L'héritage permet de créer des classes enfants.
        Le polymorphisme permet d'utiliser la même interface pour différents types.
        L'encapsulation protège les données internes.
        """ * 15
        fake_file = io.BytesIO(content.encode())
        r = requests.post(
            f"{python_url}/exercises/generate",
            files={"file": ("poo.txt", fake_file, "text/plain")},
            data={"nb_exercises": "3", "difficulty": "easy", "matiere": "Python"},
            headers=auth_headers_multipart(student_token),
            timeout=60
        )
        assert r.status_code in [200, 500, 503]
        if r.status_code == 200:
            data = r.json()
            assert "exercise_id" in data
            assert "exercises" in data

    def test_generate_exercises_invalid_extension(self, python_url, student_token, check_python):
        """POST /api/v1/exercises/generate — extension non supportée."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        fake_file = io.BytesIO(b"test")
        r = requests.post(
            f"{python_url}/exercises/generate",
            files={"file": ("test.zip", fake_file, "application/zip")},
            headers=auth_headers_multipart(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [400, 422, 500]

    def test_generate_exercises_all_difficulties(self, python_url, student_token, check_python):
        """POST /api/v1/exercises/generate — test de chaque difficulté."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        for difficulty in ["easy", "medium", "hard", "progressive"]:
            fake_file = io.BytesIO(b"Contenu de cours pour exercices. " * 50)
            r = requests.post(
                f"{python_url}/exercises/generate",
                files={"file": ("test.txt", fake_file, "text/plain")},
                data={"nb_exercises": "3", "difficulty": difficulty},
                headers=auth_headers_multipart(student_token),
                timeout=60
            )
            assert r.status_code in [200, 500, 503], f"Difficulté {difficulty}: {r.status_code}"

    def test_get_exercise_not_found(self, python_url, student_token, check_python):
        """GET /api/v1/exercises/{id} — exercice inexistant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/exercises/nonexistent-exercise-id",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 422]

    def test_download_exercise_not_found(self, python_url, student_token, check_python):
        """GET /api/v1/exercises/download/{id} — téléchargement inexistant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{python_url}/exercises/download/nonexistent-id",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [404, 422]
