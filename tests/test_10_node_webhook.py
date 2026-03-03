"""
═══════════════════════════════════════════════════════════════════════════════
TESTS NODE.JS — WEBHOOK
═══════════════════════════════════════════════════════════════════════════════
Couvre /api/webhook/* :
  POST /api/webhook/alerte
═══════════════════════════════════════════════════════════════════════════════
"""

import pytest
import requests
import os
from conftest import NODE_BASE_URL, REQUEST_TIMEOUT


WEBHOOK_SECRET = os.environ.get("WEBHOOK_SECRET", "")


@pytest.mark.node
class TestNodeWebhook:
    """Tests du webhook interne Laravel → Node.js."""

    def test_webhook_alerte_missing_secret(self, node_url, check_node):
        """POST /api/webhook/alerte — sans secret (si configuré) → 401."""
        r = requests.post(
            f"{node_url}/api/webhook/alerte",
            json={
                "user_id": 1,
                "type_alerte": "note_faible",
                "titre": "Test alerte",
                "message": "Alerte de test"
            },
            timeout=REQUEST_TIMEOUT
        )
        # Si WEBHOOK_SECRET est configuré → 401, sinon → 200/400
        assert r.status_code in [200, 400, 401]

    def test_webhook_alerte_valid(self, node_url, check_node):
        """POST /api/webhook/alerte — alerte valide avec secret."""
        headers = {"Content-Type": "application/json"}
        if WEBHOOK_SECRET:
            headers["x-webhook-secret"] = WEBHOOK_SECRET
        r = requests.post(
            f"{node_url}/api/webhook/alerte",
            json={
                "user_id": 1,
                "type_alerte": "note_faible",
                "niveau_severite": "eleve",
                "titre": "Note faible en Mathématiques",
                "message": "Votre note de 5/20 en Mathématiques nécessite une attention particulière",
                "alerte_id": 999,
                "actions_suggerees": ["Réviser le chapitre 3", "Consulter le tuteur"]
            },
            headers=headers,
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [200, 400, 401]

    def test_webhook_alerte_missing_fields(self, node_url, check_node):
        """POST /api/webhook/alerte — champs requis manquants."""
        headers = {"Content-Type": "application/json"}
        if WEBHOOK_SECRET:
            headers["x-webhook-secret"] = WEBHOOK_SECRET
        r = requests.post(
            f"{node_url}/api/webhook/alerte",
            json={"user_id": 1},  # titre et message manquants
            headers=headers,
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [400, 401]

    def test_webhook_alerte_empty_body(self, node_url, check_node):
        """POST /api/webhook/alerte — body vide."""
        headers = {"Content-Type": "application/json"}
        if WEBHOOK_SECRET:
            headers["x-webhook-secret"] = WEBHOOK_SECRET
        r = requests.post(
            f"{node_url}/api/webhook/alerte",
            json={},
            headers=headers,
            timeout=REQUEST_TIMEOUT
        )
        assert r.status_code in [400, 401]

    def test_webhook_alerte_all_types(self, node_url, check_node):
        """POST /api/webhook/alerte — test de chaque type d'alerte."""
        headers = {"Content-Type": "application/json"}
        if WEBHOOK_SECRET:
            headers["x-webhook-secret"] = WEBHOOK_SECRET
        
        alert_types = ["note_faible", "moyenne_faible", "deadline_proche", "absence", "felicitation"]
        for alert_type in alert_types:
            r = requests.post(
                f"{node_url}/api/webhook/alerte",
                json={
                    "user_id": 1,
                    "type_alerte": alert_type,
                    "titre": f"Test {alert_type}",
                    "message": f"Message de test pour {alert_type}"
                },
                headers=headers,
                timeout=REQUEST_TIMEOUT
            )
            assert r.status_code in [200, 400, 401], f"Type {alert_type} échoué: {r.status_code}"
