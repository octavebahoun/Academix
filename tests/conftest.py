"""
Configuration globale pytest pour la suite de tests AcademiX.
Définit les fixtures partagées, les URLs de base et les tokens d'authentification.
"""

import os
import pytest
import requests
import time

# ══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION DES URLS DE BASE
# Modifier ces valeurs si vos serveurs tournent sur des ports différents
# ══════════════════════════════════════════════════════════════════════════════
LARAVEL_BASE_URL = os.environ.get("LARAVEL_BASE_URL", "http://localhost:8000/api/v1")
NODE_BASE_URL = os.environ.get("NODE_BASE_URL", "http://localhost:3001")
PYTHON_BASE_URL = os.environ.get("PYTHON_BASE_URL", "http://localhost:5000/api/v1")

# ══════════════════════════════════════════════════════════════════════════════
# COMPTES DE TEST
# ══════════════════════════════════════════════════════════════════════════════
ADMIN_EMAIL = os.environ.get("TEST_ADMIN_EMAIL", "admin@academix.com")
ADMIN_PASSWORD = os.environ.get("TEST_ADMIN_PASSWORD", "password")

CHEF_EMAIL = os.environ.get("TEST_CHEF_EMAIL", "chef@academix.com")
CHEF_PASSWORD = os.environ.get("TEST_CHEF_PASSWORD", "password")

STUDENT_EMAIL = os.environ.get("TEST_STUDENT_EMAIL", "etudiant@academix.com")
STUDENT_PASSWORD = os.environ.get("TEST_STUDENT_PASSWORD", "password")
STUDENT_MATRICULE = os.environ.get("TEST_STUDENT_MATRICULE", "ETU001")

# Timeout pour les requêtes HTTP
REQUEST_TIMEOUT = 15


# ══════════════════════════════════════════════════════════════════════════════
# FIXTURES PYTEST
# ══════════════════════════════════════════════════════════════════════════════

@pytest.fixture(scope="session")
def laravel_url():
    """URL de base de l'API Laravel."""
    return LARAVEL_BASE_URL


@pytest.fixture(scope="session")
def node_url():
    """URL de base du serveur Node.js."""
    return NODE_BASE_URL


@pytest.fixture(scope="session")
def python_url():
    """URL de base de l'API Python FastAPI."""
    return PYTHON_BASE_URL


@pytest.fixture(scope="session")
def check_laravel(laravel_url):
    """Vérifie que le serveur Laravel est accessible."""
    try:
        # Tente un login pour vérifier la connectivité
        r = requests.post(
            f"{laravel_url}/auth/admin/login",
            json={"email": "test@test.com", "password": "test"},
            timeout=REQUEST_TIMEOUT
        )
        return True
    except (requests.ConnectionError, requests.Timeout, requests.RequestException) as e:
        pytest.skip(f"Serveur Laravel non accessible: {type(e).__name__}")
        return False


@pytest.fixture(scope="session")
def check_node(node_url):
    """Vérifie que le serveur Node.js est accessible."""
    try:
        r = requests.get(f"{node_url}/health", timeout=REQUEST_TIMEOUT)
        return True
    except (requests.ConnectionError, requests.Timeout, requests.RequestException) as e:
        pytest.skip(f"Serveur Node.js non accessible: {type(e).__name__}")
        return False


@pytest.fixture(scope="session")
def check_python(python_url):
    """Vérifie que le serveur Python est accessible."""
    try:
        r = requests.get(f"{python_url.replace('/api/v1', '')}/", timeout=REQUEST_TIMEOUT)
        return True
    except (requests.ConnectionError, requests.Timeout, requests.RequestException) as e:
        pytest.skip(f"Serveur Python non accessible: {type(e).__name__}")
        return False


@pytest.fixture(scope="session")
def admin_token(laravel_url):
    """Obtient un token admin via login ou variable d'environnement."""
    # Fallback : variable d'environnement
    env_token = os.environ.get("TEST_ADMIN_TOKEN")
    if env_token:
        return env_token
    try:
        r = requests.post(
            f"{laravel_url}/auth/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=REQUEST_TIMEOUT
        )
        if r.status_code == 200:
            data = r.json()
            token = data.get("token") or data.get("data", {}).get("token") or data.get("access_token")
            if token:
                return token
        return None
    except Exception:
        return None


@pytest.fixture(scope="session")
def chef_token(laravel_url):
    """Obtient un token chef de département via login ou variable d'environnement."""
    # Fallback : variable d'environnement
    env_token = os.environ.get("TEST_CHEF_TOKEN")
    if env_token:
        return env_token
    try:
        r = requests.post(
            f"{laravel_url}/auth/chef/login",
            json={"email": CHEF_EMAIL, "password": CHEF_PASSWORD},
            timeout=REQUEST_TIMEOUT
        )
        if r.status_code == 200:
            data = r.json()
            token = data.get("token") or data.get("data", {}).get("token") or data.get("access_token")
            if token:
                return token
        return None
    except Exception:
        return None


@pytest.fixture(scope="session")
def student_token(laravel_url):
    """Obtient un token étudiant via login ou variable d'environnement."""
    # Fallback : variable d'environnement
    env_token = os.environ.get("TEST_STUDENT_TOKEN")
    if env_token:
        return env_token
    try:
        r = requests.post(
            f"{laravel_url}/auth/student/login",
            json={
                "email": STUDENT_EMAIL,
                "password": STUDENT_PASSWORD,
                "matricule": STUDENT_MATRICULE
            },
            timeout=REQUEST_TIMEOUT
        )
        if r.status_code == 200:
            data = r.json()
            token = data.get("token") or data.get("data", {}).get("token") or data.get("access_token")
            if token:
                return token
        return None
    except Exception:
        return None


def auth_headers(token):
    """Génère les headers d'authentification."""
    if not token:
        return {"Content-Type": "application/json"}
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }


def auth_headers_multipart(token):
    """Génère les headers d'authentification pour upload."""
    if not token:
        return {}
    return {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }


# ══════════════════════════════════════════════════════════════════════════════
# MARQUEURS PERSONNALISÉS
# ══════════════════════════════════════════════════════════════════════════════

def pytest_configure(config):
    """Enregistre les marqueurs personnalisés."""
    config.addinivalue_line("markers", "laravel: tests pour l'API Laravel")
    config.addinivalue_line("markers", "node: tests pour l'API Node.js")
    config.addinivalue_line("markers", "python_api: tests pour l'API Python")
    config.addinivalue_line("markers", "auth: tests d'authentification")
    config.addinivalue_line("markers", "admin: tests admin")
    config.addinivalue_line("markers", "departement: tests chef de département")
    config.addinivalue_line("markers", "student: tests étudiant")
    config.addinivalue_line("markers", "crud: tests CRUD")
    config.addinivalue_line("markers", "ai: tests services IA")
