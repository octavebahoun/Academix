"""
═══════════════════════════════════════════════════════════════════════════════
TESTS NODE.JS — NOTIFICATIONS
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/notifications/* :
  GET    /api/notifications
  GET    /api/notifications/unread-count
  POST   /api/notifications
  PATCH  /api/notifications/read-all
  PATCH  /api/notifications/:id/read
  DELETE /api/notifications/:id
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
from conftest import NODE_BASE_URL, REQUEST_TIMEOUT, auth_headers


@pytest.mark.node
class TestNodeNotifications:
    """Tests des notifications."""

    def test_list_notifications_no_auth(self, node_url, check_node):
        """GET /api/notifications — sans auth → 401."""
        r = requests.get(f"{node_url}/api/notifications", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_list_notifications(self, node_url, student_token, check_node):
        """GET /api/notifications — liste des notifications."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{node_url}/api/notifications",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_unread_count_no_auth(self, node_url, check_node):
        """GET /api/notifications/unread-count — sans auth → 401."""
        r = requests.get(f"{node_url}/api/notifications/unread-count", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_unread_count(self, node_url, student_token, check_node):
        """GET /api/notifications/unread-count — nombre de non-lues."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.get(
            f"{node_url}/api/notifications/unread-count",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_create_notification_no_auth(self, node_url, check_node):
        """POST /api/notifications — sans auth → 401."""
        r = requests.post(
            f"{node_url}/api/notifications",
            json={"titre": "Test", "message": "Test notif"},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [401, 403]

    def test_create_notification(self, node_url, student_token, check_node):
        """POST /api/notifications — création."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.post(
            f"{node_url}/api/notifications",
            json={
                "titre": "Notification de test",
                "message": "Créée par les tests automatisés",
                "type": "info"
            },
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 201, 422]

    def test_mark_all_read_no_auth(self, node_url, check_node):
        """PATCH /api/notifications/read-all — sans auth → 401."""
        r = requests.patch(f"{node_url}/api/notifications/read-all", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_mark_all_read(self, node_url, student_token, check_node):
        """PATCH /api/notifications/read-all — marquer toutes lues."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.patch(
            f"{node_url}/api/notifications/read-all",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_mark_one_read_no_auth(self, node_url, check_node):
        """PATCH /api/notifications/:id/read — sans auth → 401."""
        r = requests.patch(f"{node_url}/api/notifications/fake_id/read", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_mark_one_read(self, node_url, student_token, check_node):
        """PATCH /api/notifications/:id/read — marquer une lue."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.patch(
            f"{node_url}/api/notifications/fake_notification_id/read",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 404]

    def test_delete_notification_no_auth(self, node_url, check_node):
        """DELETE /api/notifications/:id — sans auth → 401."""
        r = requests.delete(f"{node_url}/api/notifications/fake_id", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [401, 403]

    def test_delete_notification(self, node_url, student_token, check_node):
        """DELETE /api/notifications/:id — suppression."""
        if not student_token:
            pytest.skip("Token étudiant non disponible")
        r = requests.delete(
            f"{node_url}/api/notifications/fake_notification_id",
            headers=auth_headers(student_token),
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 204, 404]
