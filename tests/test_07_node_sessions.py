"""
═══════════════════════════════════════════════════════════════════════════════
TESTS NODE.JS — SESSIONS COLLABORATIVES
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/sessions/* :
  GET    /api/sessions
  POST   /api/sessions
  POST   /api/sessions/:id/join
  POST   /api/sessions/:id/rate
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
from conftest import NODE_BASE_URL, REQUEST_TIMEOUT, auth_headers


@pytest.mark.node
class TestNodeSessions:
    """Tests des sessions collaboratives."""

    def test_list_sessions_no_auth(self, node_url, check_node):
        """GET /api/sessions — sans auth → 401."""
        r = requests.get(f"{node_url}/api/sessions", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_list_sessions_with_token(self, node_url, student_token, check_node):
        """GET /api/sessions — liste des sessions."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{node_url}/api/sessions",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_create_session_no_auth(self, node_url, check_node):
        """POST /api/sessions — sans auth → 401."""
        r = requests.post(
            f"{node_url}/api/sessions",
            json={"title": "Session Test"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]

    def test_create_session(self, node_url, student_token, check_node):
        """POST /api/sessions — création d'une session."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{node_url}/api/sessions",
            json={
                "title": "Session de test unitaire",
                "description": "Session créée par les tests automatisés",
                "matiere": "Mathématiques"
            },
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]

    def test_create_session_empty_body(self, node_url, student_token, check_node):
        """POST /api/sessions — body vide."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{node_url}/api/sessions",
            json={},
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400, 200, 201]

    def test_join_session_no_auth(self, node_url, check_node):
        """POST /api/sessions/:id/join — sans auth → 401."""
        r = requests.post(f"{node_url}/api/sessions/1/join", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_join_session(self, node_url, student_token, check_node):
        """POST /api/sessions/:id/join — rejoindre une session."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{node_url}/api/sessions/fake_session_id/join",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404, 422]

    def test_rate_session_no_auth(self, node_url, check_node):
        """POST /api/sessions/:id/rate — sans auth → 401."""
        r = requests.post(
            f"{node_url}/api/sessions/1/rate",
            json={"rating": 5},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]

    def test_rate_session(self, node_url, student_token, check_node):
        """POST /api/sessions/:id/rate — noter une session."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{node_url}/api/sessions/fake_session_id/rate",
            json={"rating": 4, "comment": "Test rating"},
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404, 422]
