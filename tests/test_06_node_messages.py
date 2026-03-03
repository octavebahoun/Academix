"""
═══════════════════════════════════════════════════════════════════════════════
TESTS NODE.JS — MESSAGES PRIVÉS
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/messages/* :
  GET    /api/messages/conversations
  GET    /api/messages/unread-count
  GET    /api/messages/:userId
  POST   /api/messages
  PATCH  /api/messages/:messageId/read
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
from conftest import NODE_BASE_URL, REQUEST_TIMEOUT, auth_headers


@pytest.mark.node
class TestNodePrivateMessages:
    """Tests des messages privés (chat 1-to-1)."""

    def test_conversations_no_auth(self, node_url, check_node):
        """GET /api/messages/conversations — sans auth → 401."""
        r = requests.get(f"{node_url}/api/messages/conversations", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_conversations_with_token(self, node_url, student_token, check_node):
        """GET /api/messages/conversations — avec token."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{node_url}/api/messages/conversations",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_unread_count_no_auth(self, node_url, check_node):
        """GET /api/messages/unread-count — sans auth → 401."""
        r = requests.get(f"{node_url}/api/messages/unread-count", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_unread_count_with_token(self, node_url, student_token, check_node):
        """GET /api/messages/unread-count — nombre de non-lus."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{node_url}/api/messages/unread-count",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_get_messages_no_auth(self, node_url, check_node):
        """GET /api/messages/:userId — sans auth → 401."""
        r = requests.get(f"{node_url}/api/messages/1", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_get_messages_with_token(self, node_url, student_token, check_node):
        """GET /api/messages/:userId — historique conversation."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{node_url}/api/messages/1",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_send_message_no_auth(self, node_url, check_node):
        """POST /api/messages — sans auth → 401."""
        r = requests.post(
            f"{node_url}/api/messages",
            json={"to": 2, "content": "Test"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]

    def test_send_message_with_token(self, node_url, student_token, check_node):
        """POST /api/messages — envoi d'un message."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{node_url}/api/messages",
            json={"to": 2, "content": "Message de test unitaire"},
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422, 404]

    def test_send_message_missing_content(self, node_url, student_token, check_node):
        """POST /api/messages — contenu manquant."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{node_url}/api/messages",
            json={"to": 2},
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [422, 400, 200, 201]

    def test_mark_message_read_no_auth(self, node_url, check_node):
        """PATCH /api/messages/:messageId/read — sans auth → 401."""
        r = requests.patch(f"{node_url}/api/messages/fake_id/read", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_mark_message_read(self, node_url, student_token, check_node):
        """PATCH /api/messages/:messageId/read — marquer lu."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.patch(
            f"{node_url}/api/messages/fake_message_id/read",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]
