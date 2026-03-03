"""
═══════════════════════════════════════════════════════════════════════════════
TESTS NODE.JS — ROUTES DE BASE & HEALTH
═══════════════════════════════════════════════════════════════════════════════
Couvre :
  GET  /             (status)
  GET  /health       (health check)
  GET  /api/test     (test endpoint)
  POST /api/test/echo
  GET  /api/test/hello/:name
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
from conftest import NODE_BASE_URL, REQUEST_TIMEOUT


@pytest.mark.node
class TestNodeBase:
    """Tests des routes de base du serveur Node.js."""

    def test_root_endpoint(self, node_url, check_node):
        """GET / — page d'accueil."""
        r = requests.get(f"{node_url}/", timeout=REQUEST_TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        assert "status" in data or "message" in data

    def test_health_check(self, node_url, check_node):
        """GET /health — vérification santé du serveur."""
        r = requests.get(f"{node_url}/health", timeout=REQUEST_TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "OK"
        assert "timestamp" in data
        assert "uptime" in data
        assert "mongodb" in data

    def test_health_has_correct_fields(self, node_url, check_node):
        """GET /health — vérification des champs retournés."""
        r = requests.get(f"{node_url}/health", timeout=REQUEST_TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        expected_fields = ["status", "timestamp", "uptime", "environment", "mongodb"]
        for field in expected_fields:
            assert field in data, f"Champ manquant dans /health : {field}"

    def test_api_test(self, node_url, check_node):
        """GET /api/test — test endpoint de base."""
        r = requests.get(f"{node_url}/api/test", timeout=REQUEST_TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        assert data.get("success") is True
        assert "data" in data

    def test_api_test_echo(self, node_url, check_node):
        """POST /api/test/echo — echo du body."""
        payload = {"message": "Hello", "number": 42, "nested": {"key": "value"}}
        r = requests.post(
            f"{node_url}/api/test/echo",
            json=payload,
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200
        data = r.json()
        assert data.get("success") is True
        assert data.get("received") == payload

    def test_api_test_echo_empty_body(self, node_url, check_node):
        """POST /api/test/echo — body vide."""
        r = requests.post(
            f"{node_url}/api/test/echo",
            json={},
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code == 200

    def test_api_test_hello(self, node_url, check_node):
        """GET /api/test/hello/:name — salutation personnalisée."""
        r = requests.get(f"{node_url}/api/test/hello/Octave", timeout=REQUEST_TIMEOUT)
        assert r.status_code == 200
        data = r.json()
        assert data.get("success") is True
        assert "Octave" in data.get("message", "")

    def test_api_test_hello_special_chars(self, node_url, check_node):
        """GET /api/test/hello/:name — caractères spéciaux."""
        r = requests.get(f"{node_url}/api/test/hello/Jean-Pierre", timeout=REQUEST_TIMEOUT)
        assert r.status_code == 200

    def test_nonexistent_route(self, node_url, check_node):
        """GET /nonexistent — route inexistante → 404."""
        r = requests.get(f"{node_url}/nonexistent-route-xyz", timeout=REQUEST_TIMEOUT)
        assert r.status_code in [404, 500]
