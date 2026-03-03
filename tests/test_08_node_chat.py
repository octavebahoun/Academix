"""
═══════════════════════════════════════════════════════════════════════════════
TESTS NODE.JS — CHAT SESSIONS COLLABORATIVES
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/chat/* :
  POST  /api/chat/upload
  GET   /api/chat/:sessionId/messages
  GET   /api/chat/:sessionId/participants
  GET   /api/chat/:sessionId/mentions
  GET   /api/chat/:sessionId/whiteboard-state
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
import io
from conftest import NODE_BASE_URL, REQUEST_TIMEOUT, auth_headers, auth_headers_multipart


@pytest.mark.node
class TestNodeChat:
    """Tests du chat des sessions collaboratives."""

    def test_upload_no_auth(self, node_url, check_node):
        """POST /api/chat/upload — sans auth → 401."""
        r = requests.post(f"{node_url}/api/chat/upload", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_upload_with_file(self, node_url, student_token, check_node):
        """POST /api/chat/upload — upload de fichier."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        fake_file = io.BytesIO(b"Contenu de test pour upload chat")
        r = requests.post(
            f"{node_url}/api/chat/upload",
            files={"file": ("test.txt", fake_file, "text/plain")},
            headers=auth_headers_multipart(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422, 400]

    def test_upload_no_file(self, node_url, student_token, check_node):
        """POST /api/chat/upload — sans fichier."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{node_url}/api/chat/upload",
            headers=auth_headers_multipart(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [400, 422, 500]

    def test_get_messages_no_auth(self, node_url, check_node):
        """GET /api/chat/:sessionId/messages — sans auth → 401."""
        r = requests.get(f"{node_url}/api/chat/test_session/messages", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_get_messages(self, node_url, student_token, check_node):
        """GET /api/chat/:sessionId/messages — messages d'une session."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{node_url}/api/chat/test_session_id/messages",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_get_participants_no_auth(self, node_url, check_node):
        """GET /api/chat/:sessionId/participants — sans auth → 401."""
        r = requests.get(f"{node_url}/api/chat/test_session/participants", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_get_participants(self, node_url, student_token, check_node):
        """GET /api/chat/:sessionId/participants — participants."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{node_url}/api/chat/test_session_id/participants",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_get_mentions_no_auth(self, node_url, check_node):
        """GET /api/chat/:sessionId/mentions — sans auth → 401."""
        r = requests.get(f"{node_url}/api/chat/test_session/mentions", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_get_mentions(self, node_url, student_token, check_node):
        """GET /api/chat/:sessionId/mentions — suggestions de mentions."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{node_url}/api/chat/test_session_id/mentions",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_get_whiteboard_state_no_auth(self, node_url, check_node):
        """GET /api/chat/:sessionId/whiteboard-state — sans auth → 401."""
        r = requests.get(f"{node_url}/api/chat/test_session/whiteboard-state", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_get_whiteboard_state(self, node_url, student_token, check_node):
        """GET /api/chat/:sessionId/whiteboard-state — état du whiteboard."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{node_url}/api/chat/test_session_id/whiteboard-state",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]
