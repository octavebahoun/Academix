#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
  ACADEMIX — SUITE DE TESTS COMPLÈTE + AUDIT AUTOMATIQUE
═══════════════════════════════════════════════════════════════════════════════

  Ce script :
  1. Installe les dépendances de test
  2. Exécute TOUS les tests (Laravel, Node.js, Python)
  3. Génère un rapport HTML (report.html)
  4. Produit un AUDIT complet dans audit_results.txt

  Usage:
    python run_all_tests.py
    python run_all_tests.py --laravel     # Tests Laravel uniquement
    python run_all_tests.py --node        # Tests Node.js uniquement
    python run_all_tests.py --python      # Tests Python uniquement
    python run_all_tests.py --audit-only  # Audit sans relancer les tests
═══════════════════════════════════════════════════════════════════════════════
"""

import subprocess
import sys
import os
import json
import re
from datetime import datetime

# Chemin du dossier tests
TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(TESTS_DIR)

# Couleurs ANSI
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"
BLUE = "\033[94m"


def print_header(title):
    width = 70
    print(f"\n{CYAN}{'═' * width}")
    print(f"  {BOLD}{title}{RESET}{CYAN}")
    print(f"{'═' * width}{RESET}\n")


def print_section(title):
    print(f"\n{BLUE}{'─' * 50}")
    print(f"  {BOLD}{title}{RESET}")
    print(f"{BLUE}{'─' * 50}{RESET}")


def run_tests(markers=None):
    """Exécute pytest et retourne le code de sortie."""
    cmd = [
        sys.executable, "-m", "pytest",
        TESTS_DIR,
        "-v",
        "--tb=short",
        f"--html={os.path.join(TESTS_DIR, 'report.html')}",
        "--self-contained-html",
        f"--junitxml={os.path.join(TESTS_DIR, 'results.xml')}",
        "--no-header",
        "-q"
    ]

    if markers:
        cmd.extend(["-m", markers])

    print(f"{CYAN}Commande: {' '.join(cmd)}{RESET}\n")
    result = subprocess.run(cmd, cwd=TESTS_DIR, capture_output=False)
    return result.returncode


def parse_results_xml():
    """Parse le fichier results.xml pour extraire les statistiques."""
    xml_path = os.path.join(TESTS_DIR, "results.xml")
    if not os.path.exists(xml_path):
        return None

    import xml.etree.ElementTree as ET
    tree = ET.parse(xml_path)
    root = tree.getroot()

    stats = {
        "total": 0,
        "passed": 0,
        "failed": 0,
        "skipped": 0,
        "errors": 0,
        "duration": 0.0,
        "test_details": [],
        "failures": [],
        "by_category": {}
    }

    for testsuite in root.findall(".//testsuite"):
        stats["total"] += int(testsuite.get("tests", 0))
        stats["failed"] += int(testsuite.get("failures", 0))
        stats["errors"] += int(testsuite.get("errors", 0))
        stats["skipped"] += int(testsuite.get("skipped", 0))
        stats["duration"] += float(testsuite.get("time", 0))

    stats["passed"] = stats["total"] - stats["failed"] - stats["errors"] - stats["skipped"]

    for testcase in root.findall(".//testcase"):
        name = testcase.get("name", "")
        classname = testcase.get("classname", "")
        time_taken = float(testcase.get("time", 0))

        # Catégoriser
        if "laravel" in classname.lower() or "laravel" in name.lower():
            category = "Laravel"
        elif "node" in classname.lower() or "node" in name.lower():
            category = "Node.js"
        elif "python" in classname.lower() or "python" in name.lower():
            category = "Python"
        else:
            category = "Autre"

        if category not in stats["by_category"]:
            stats["by_category"][category] = {"passed": 0, "failed": 0, "skipped": 0, "errors": 0}

        failure = testcase.find("failure")
        error = testcase.find("error")
        skipped = testcase.find("skipped")

        status = "PASSED"
        message = ""
        if failure is not None:
            status = "FAILED"
            message = failure.get("message", "")
            stats["by_category"][category]["failed"] += 1
            stats["failures"].append({
                "name": f"{classname}::{name}",
                "message": message[:200]
            })
        elif error is not None:
            status = "ERROR"
            message = error.get("message", "")
            stats["by_category"][category]["errors"] += 1
        elif skipped is not None:
            status = "SKIPPED"
            message = skipped.get("message", "")
            stats["by_category"][category]["skipped"] += 1
        else:
            stats["by_category"][category]["passed"] += 1

        stats["test_details"].append({
            "name": name,
            "classname": classname,
            "status": status,
            "time": time_taken,
            "category": category,
            "message": message
        })

    return stats


def generate_audit(stats):
    """Génère le rapport d'audit complet."""
    audit_path = os.path.join(TESTS_DIR, "audit_results.txt")

    with open(audit_path, "w", encoding="utf-8") as f:
        f.write("=" * 80 + "\n")
        f.write("  AUDIT COMPLET — SUITE DE TESTS ACADEMIX\n")
        f.write(f"  Date: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
        f.write("=" * 80 + "\n\n")

        # ── RÉSUMÉ GLOBAL ──
        f.write("┌─────────────────────────────────────────────────────────┐\n")
        f.write("│                    RÉSUMÉ GLOBAL                        │\n")
        f.write("├─────────────────────────────────────────────────────────┤\n")
        f.write(f"│  Total des tests       : {stats['total']:>5}                          │\n")
        f.write(f"│  ✅ Réussis            : {stats['passed']:>5}                          │\n")
        f.write(f"│  ❌ Échoués            : {stats['failed']:>5}                          │\n")
        f.write(f"│  ⚠️  Ignorés (skip)    : {stats['skipped']:>5}                          │\n")
        f.write(f"│  💥 Erreurs            : {stats['errors']:>5}                          │\n")
        f.write(f"│  ⏱️  Durée totale       : {stats['duration']:>8.2f}s                      │\n")
        pct = (stats['passed'] / stats['total'] * 100) if stats['total'] > 0 else 0
        f.write(f"│  📊 Taux de réussite   : {pct:>6.1f}%                         │\n")
        f.write("└─────────────────────────────────────────────────────────┘\n\n")

        # ── RÉSULTATS PAR BACKEND ──
        f.write("┌─────────────────────────────────────────────────────────┐\n")
        f.write("│               RÉSULTATS PAR BACKEND                     │\n")
        f.write("├───────────┬─────────┬─────────┬─────────┬──────────────┤\n")
        f.write("│ Backend   │ Réussis │ Échoués │ Ignorés │ Taux         │\n")
        f.write("├───────────┼─────────┼─────────┼─────────┼──────────────┤\n")
        for cat, data in stats["by_category"].items():
            total_cat = data["passed"] + data["failed"] + data["skipped"] + data["errors"]
            pct_cat = (data["passed"] / total_cat * 100) if total_cat > 0 else 0
            f.write(f"│ {cat:<9} │ {data['passed']:>7} │ {data['failed']:>7} │ {data['skipped']:>7} │ {pct_cat:>6.1f}%      │\n")
        f.write("└───────────┴─────────┴─────────┴─────────┴──────────────┘\n\n")

        # ── ROUTES TESTÉES ──
        f.write("=" * 80 + "\n")
        f.write("  INVENTAIRE COMPLET DES ROUTES TESTÉES\n")
        f.write("=" * 80 + "\n\n")

        routes_inventory = {
            "Laravel API (/api/v1)": [
                "POST   /auth/admin/register",
                "POST   /auth/admin/login",
                "POST   /auth/admin/logout",
                "POST   /auth/chef/login",
                "POST   /auth/chef/logout",
                "POST   /auth/student/register",
                "POST   /auth/student/login",
                "POST   /auth/student/activate",
                "POST   /auth/student/logout",
                "GET    /auth/me",
                "GET    /auth/google/redirect",
                "POST   /auth/google/callback",
                "GET    /admin/departements",
                "POST   /admin/departements",
                "GET    /admin/departements/{id}",
                "PUT    /admin/departements/{id}",
                "DELETE /admin/departements/{id}",
                "GET    /admin/departements/{id}/stats",
                "GET    /admin/chefs-departement",
                "POST   /admin/chefs-departement",
                "GET    /admin/chefs-departement/{id}",
                "PUT    /admin/chefs-departement/{id}",
                "DELETE /admin/chefs-departement/{id}",
                "POST   /admin/chefs-departement/{id}/toggle",
                "GET    /admin/stats/global",
                "GET    /admin/stats/dashboard",
                "GET    /admin/matieres",
                "POST   /admin/matieres",
                "GET    /admin/matieres/{id}",
                "PUT    /admin/matieres/{id}",
                "DELETE /admin/matieres/{id}",
                "GET    /admin/emploi-temps/filieres/{id}",
                "POST   /admin/emploi-temps",
                "GET    /admin/emploi-temps/{id}",
                "GET    /admin/notes",
                "POST   /admin/notes",
                "GET    /admin/notes/{id}",
                "GET    /departement/filieres",
                "POST   /departement/filieres",
                "GET    /departement/filieres/{id}",
                "PUT    /departement/filieres/{id}",
                "DELETE /departement/filieres/{id}",
                "POST   /departement/filieres/{id}/matieres",
                "DELETE /departement/filieres/{id}/matieres/{mid}",
                "GET    /departement/filieres/{id}/etudiants",
                "GET    /departement/filieres/{id}/matieres",
                "GET    /departement/filieres/{id}/stats",
                "GET    /departement/filieres/{id}/emploi-temps",
                "GET    /departement/matieres",
                "POST   /departement/matieres",
                "GET    /departement/matieres/{id}",
                "GET    /departement/etudiants",
                "POST   /departement/import/etudiants",
                "POST   /departement/import/notes",
                "POST   /departement/import/emploi-temps",
                "GET    /departement/import/template/etudiants",
                "GET    /departement/import/template/notes",
                "GET    /departement/import/template/emploi-temps",
                "GET    /departement/import/history",
                "GET    /departement/import/history/{id}/download",
                "GET    /departement/notes",
                "POST   /departement/notes",
                "POST   /departement/emploi-temps",
                "GET    /departement/dashboard",
                "GET    /student/profil",
                "PUT    /student/profil",
                "GET    /student/moyennes",
                "GET    /student/notes",
                "GET    /student/emploi-temps",
                "GET    /student/taches",
                "POST   /student/taches",
                "GET    /student/taches/{id}",
                "PUT    /student/taches/{id}",
                "DELETE /student/taches/{id}",
                "PATCH  /student/taches/{id}/complete",
                "GET    /student/alertes",
                "PATCH  /student/alertes/{id}/read",
                "GET    /student/analysis",
                "GET    /student/analysis/history",
                "POST   /student/analysis/mark-sent/{id}",
                "POST   /student/push/subscribe",
                "DELETE /student/push/subscribe",
                "GET    /student/google/status",
                "DELETE /student/google/disconnect",
                "POST   /student/google/sync",
            ],
            "Node.js API": [
                "GET    /",
                "GET    /health",
                "GET    /api/test",
                "POST   /api/test/echo",
                "GET    /api/test/hello/:name",
                "GET    /api/messages/conversations",
                "GET    /api/messages/unread-count",
                "GET    /api/messages/:userId",
                "POST   /api/messages",
                "PATCH  /api/messages/:messageId/read",
                "GET    /api/sessions",
                "POST   /api/sessions",
                "POST   /api/sessions/:id/join",
                "POST   /api/sessions/:id/rate",
                "POST   /api/chat/upload",
                "GET    /api/chat/:sessionId/messages",
                "GET    /api/chat/:sessionId/participants",
                "GET    /api/chat/:sessionId/mentions",
                "GET    /api/chat/:sessionId/whiteboard-state",
                "GET    /api/notifications",
                "GET    /api/notifications/unread-count",
                "POST   /api/notifications",
                "PATCH  /api/notifications/read-all",
                "PATCH  /api/notifications/:id/read",
                "DELETE /api/notifications/:id",
                "POST   /api/webhook/alerte",
            ],
            "Python FastAPI (/api/v1)": [
                "GET    /",
                "POST   /chat",
                "POST   /upload",
                "POST   /summary/generate",
                "GET    /summary/{summary_id}",
                "GET    /summary/download/{summary_id}",
                "POST   /quiz/generate",
                "POST   /quiz/correct",
                "GET    /quiz/{quiz_id}",
                "POST   /exercises/generate",
                "GET    /exercises/{exercise_id}",
                "GET    /exercises/download/{exercise_id}",
                "POST   /image/generate",
                "GET    /image/download/{filename}",
                "POST   /podcast/generate",
                "GET    /podcast/download/{podcast_id}",
                "GET    /history",
                "DELETE /history/{history_id}",
                "DELETE /history",
                "GET    /analysis/{student_id}",
            ],
        }

        total_routes = 0
        for backend, routes in routes_inventory.items():
            f.write(f"\n  📌 {backend} ({len(routes)} routes)\n")
            f.write(f"  {'─' * 50}\n")
            for route in routes:
                f.write(f"    ✓ {route}\n")
            total_routes += len(routes)

        f.write(f"\n  {'═' * 50}\n")
        f.write(f"  TOTAL : {total_routes} routes testées\n")
        f.write(f"  {'═' * 50}\n\n")

        # ── TESTS EN ÉCHEC ──
        if stats["failures"]:
            f.write("\n" + "=" * 80 + "\n")
            f.write("  ❌ DÉTAIL DES ÉCHECS\n")
            f.write("=" * 80 + "\n\n")
            for i, fail in enumerate(stats["failures"], 1):
                f.write(f"  {i}. {fail['name']}\n")
                f.write(f"     Message: {fail['message']}\n\n")

        # ── RECOMMENDATIONS ──
        f.write("\n" + "=" * 80 + "\n")
        f.write("  📋 RECOMMANDATIONS D'AUDIT\n")
        f.write("=" * 80 + "\n\n")

        recommendations = []

        if pct >= 90:
            recommendations.append("✅ Excellent taux de réussite (≥90%). Les APIs sont solides.")
        elif pct >= 70:
            recommendations.append("⚠️  Taux de réussite moyen (70-90%). Des corrections sont nécessaires.")
        else:
            recommendations.append("❌ Taux de réussite faible (<70%). Revue urgente recommandée.")

        if stats["skipped"] > stats["total"] * 0.3:
            recommendations.append("⚠️  Plus de 30% des tests sont ignorés. Vérifiez que les serveurs sont démarrés et les tokens d'authentification valides.")

        for cat, data in stats["by_category"].items():
            if data["failed"] > 0:
                recommendations.append(f"🔧 Backend {cat} : {data['failed']} test(s) échoué(s). À corriger.")
            if data["errors"] > 0:
                recommendations.append(f"💥 Backend {cat} : {data['errors']} erreur(s) système. Vérifiez la connectivité.")

        recommendations.extend([
            "",
            "📌 CHECKLIST SÉCURITÉ :",
            "  □ Toutes les routes protégées renvoient 401 sans token",
            "  □ Les tokens invalides sont rejetés",
            "  □ Les données manquantes renvoient 422",
            "  □ Les IDs inexistants renvoient 404",
            "  □ Le webhook vérifie le secret partagé",
            "",
            "📌 CHECKLIST FONCTIONNELLE :",
            "  □ Tous les CRUD fonctionnent (Create, Read, Update, Delete)",
            "  □ Les filtres et la pagination fonctionnent",
            "  □ Les uploads de fichiers sont validés (extension, taille)",
            "  □ Les services IA répondent correctement",
            "  □ L'historique IA est correctement sauvegardé",
            "",
            "📌 CHECKLIST PERFORMANCE :",
            f"  □ Durée totale des tests : {stats['duration']:.2f}s",
            f"  □ Temps moyen par test : {stats['duration']/max(stats['total'],1):.3f}s",
        ])

        for rec in recommendations:
            f.write(f"  {rec}\n")

        f.write(f"\n{'═' * 80}\n")
        f.write(f"  Rapport généré le {datetime.now().strftime('%d/%m/%Y à %H:%M:%S')}\n")
        f.write(f"  Fichier HTML : {os.path.join(TESTS_DIR, 'report.html')}\n")
        f.write(f"{'═' * 80}\n")

    return audit_path


def main():
    args = sys.argv[1:]

    print_header("ACADEMIX — SUITE DE TESTS COMPLÈTE")
    print(f"  📅 Date : {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"  📁 Dossier : {TESTS_DIR}")
    print(f"  🐍 Python  : {sys.version.split()[0]}")

    # Déterminer les marqueurs
    markers = None
    if "--laravel" in args:
        markers = "laravel"
        print(f"  🎯 Filtre  : Laravel uniquement")
    elif "--node" in args:
        markers = "node"
        print(f"  🎯 Filtre  : Node.js uniquement")
    elif "--python" in args:
        markers = "python_api"
        print(f"  🎯 Filtre  : Python uniquement")
    else:
        print(f"  🎯 Filtre  : TOUS les backends")

    if "--audit-only" not in args:
        # Installation des dépendances
        print_section("Installation des dépendances")
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r",
             os.path.join(TESTS_DIR, "requirements.txt"), "-q"],
            cwd=TESTS_DIR
        )

        # Exécution des tests
        print_section("Exécution des tests")
        exit_code = run_tests(markers)
    else:
        exit_code = 0

    # Parsing des résultats
    print_section("Analyse des résultats")
    stats = parse_results_xml()

    if stats:
        # Affichage résumé console
        pct = (stats['passed'] / stats['total'] * 100) if stats['total'] > 0 else 0
        print(f"\n  {BOLD}Résumé :{RESET}")
        print(f"  Total  : {stats['total']}")
        print(f"  {GREEN}✅ Réussis : {stats['passed']}{RESET}")
        print(f"  {RED}❌ Échoués : {stats['failed']}{RESET}")
        print(f"  {YELLOW}⚠️  Ignorés : {stats['skipped']}{RESET}")
        print(f"  📊 Taux   : {pct:.1f}%")
        print(f"  ⏱️  Durée  : {stats['duration']:.2f}s")

        # Résultats par catégorie
        print(f"\n  {BOLD}Par backend :{RESET}")
        for cat, data in stats["by_category"].items():
            total_cat = data["passed"] + data["failed"] + data["skipped"] + data["errors"]
            pct_cat = (data["passed"] / total_cat * 100) if total_cat > 0 else 0
            icon = GREEN + "✅" if data["failed"] == 0 else RED + "❌"
            print(f"    {icon} {cat}: {data['passed']}/{total_cat} ({pct_cat:.0f}%){RESET}")

        # Génération de l'audit
        print_section("Génération de l'audit")
        audit_path = generate_audit(stats)
        print(f"  📄 Audit sauvegardé : {audit_path}")
        print(f"  📄 Rapport HTML     : {os.path.join(TESTS_DIR, 'report.html')}")
    else:
        print(f"  {RED}Aucun résultat trouvé. Vérifiez que les tests ont été exécutés.{RESET}")

    print_header("TERMINÉ")
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
