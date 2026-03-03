import json
import os
import re
from typing import Optional
import aiomysql
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.core.config import settings
from app.api.dependencies import get_db_pool
from app.models.schemas import AnalysisResult


class StudentAnalyzer:
    """
    Service d'analyse IA des performances académiques d'un étudiant.
    - Récupère les notes, tâches et filière depuis MySQL
    - Calcule le contexte (moyennes, taux de complétion, etc.)
    - Génère un bilan personnalisé via LLM Groq
    """

    def __init__(self):
        if settings.GROQ_API_KEY:
            os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY

    # ─── Accès base de données ────────────────────────────────────────────────

    async def _fetch_student_data(self, student_id: int) -> dict:
        """
        Récupère toutes les données académiques de l'étudiant depuis MySQL.
        Utilise le pool singleton de dependencies.py.
        """
        pool = await get_db_pool()
        if not pool:
            raise ValueError("Connexion à la base de données impossible")

        async with pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cur:

                # 1. Infos étudiant + filière
                await cur.execute(
                    """
                    SELECT u.id, u.nom, u.prenom, u.email, u.annee_admission,
                           f.nom AS filiere_nom
                    FROM users u
                    LEFT JOIN filieres f ON f.id = u.filiere_id
                    WHERE u.id = %s
                    """,
                    (student_id,),
                )
                student = await cur.fetchone()
                if not student:
                    return {}

                # 2. Notes avec matière (seulement les 30 dernières)
                await cur.execute(
                    """
                    SELECT n.note, n.note_max, n.coefficient, n.type_evaluation,
                           n.date_evaluation, m.nom AS matiere_nom
                    FROM notes n
                    LEFT JOIN matieres m ON m.id = n.matiere_id
                    WHERE n.user_id = %s
                    ORDER BY n.date_evaluation DESC
                    LIMIT 30
                    """,
                    (student_id,),
                )
                notes = await cur.fetchall()

                # 3. Tâches (statut + priorité)
                await cur.execute(
                    """
                    SELECT titre, priorite, statut, date_limite
                    FROM taches
                    WHERE user_id = %s
                    ORDER BY date_limite ASC
                    LIMIT 20
                    """,
                    (student_id,),
                )
                taches = await cur.fetchall()

        return {
            "student": dict(student),
            "notes": [dict(n) for n in notes],
            "taches": [dict(t) for t in taches],
        }

    # ─── Calcul du contexte ───────────────────────────────────────────────────

    def _compute_context(self, raw_data: dict) -> dict:
        """
        Calcule les métriques académiques à partir des données brutes.
        Retourne le dictionnaire `context` qui sera stocké dans `contexte_raw`.
        """
        notes = raw_data.get("notes", [])
        taches = raw_data.get("taches", [])
        student = raw_data.get("student", {})

        # ── Moyennes par matière ──
        matieres: dict[str, dict] = {}
        for n in notes:
            nom = n.get("matiere_nom") or "Non renseignée"
            note_val = float(n.get("note", 0))
            note_max = float(n.get("note_max") or 20)
            coeff = float(n.get("coefficient") or 1)
            note_sur_20 = (note_val / note_max) * 20 if note_max > 0 else 0

            if nom not in matieres:
                matieres[nom] = {"notes_sur_20": [], "coefficients": [], "type": n.get("type_evaluation", "")}
            matieres[nom]["notes_sur_20"].append(note_sur_20)
            matieres[nom]["coefficients"].append(coeff)

        matieres_summary = []
        total_weighted = 0.0
        total_coeff = 0.0

        for nom, data in matieres.items():
            notes_list = data["notes_sur_20"]
            coeffs = data["coefficients"]
            # Moyenne simple de la matière (toutes évaluations confondues)
            avg = sum(notes_list) / len(notes_list) if notes_list else 0
            coeff_total = sum(coeffs) / len(coeffs) if coeffs else 1

            matieres_summary.append({
                "nom": nom,
                "moyenne": round(avg, 2),
                "nb_notes": len(notes_list),
                "coefficient": round(coeff_total, 1),
            })
            total_weighted += avg * coeff_total
            total_coeff += coeff_total

        moyenne_generale = round(total_weighted / total_coeff, 2) if total_coeff > 0 else 0.0

        # Matières en difficulté (< 10/20)
        matieres_faibles = [m["nom"] for m in matieres_summary if m["moyenne"] < 10]
        # Matières excellentes (>= 15/20)
        matieres_excellentes = [m["nom"] for m in matieres_summary if m["moyenne"] >= 15]

        # ── Tâches ──
        nb_taches = len(taches)
        nb_terminees = sum(1 for t in taches if t.get("statut") == "terminee")
        taux_completion = round((nb_terminees / nb_taches * 100), 1) if nb_taches > 0 else 0
        nb_urgentes = sum(1 for t in taches if t.get("priorite") == "haute" and t.get("statut") != "terminee")

        return {
            "etudiant_nom": f"{student.get('prenom', '')} {student.get('nom', '')}".strip(),
            "filiere": student.get("filiere_nom", ""),
            "niveau": student.get("annee_admission", ""),
            "moyenne_generale": moyenne_generale,
            "nb_notes_total": len(notes),
            "matieres": matieres_summary,
            "matieres_faibles": matieres_faibles,
            "matieres_excellentes": matieres_excellentes,
            "nb_taches_total": nb_taches,
            "taux_completion_taches": taux_completion,
            "nb_taches_urgentes": nb_urgentes,
        }

    # ─── Appel LLM ────────────────────────────────────────────────────────────

    def _build_prompt(self) -> str:
        return """Tu es un conseiller pédagogique expert et HONNÊTE pour une plateforme d'e-learning africaine appelée AcademiX.

Ton rôle est d'analyser les performances académiques d'un étudiant et de produire un bilan personnalisé et actionnable.

CONTEXTE ÉTUDIANT :
{context_json}

═══════════════════════════════════════════════════════════════
RÈGLES STRICTES ET NON NÉGOCIABLES POUR LE NIVEAU D'ALERTE :
═══════════════════════════════════════════════════════════════

Applique ces seuils SANS EXCEPTION en te basant sur les champs "moyenne_generale" et "matieres_faibles" du contexte :

■ "danger" → moyenne_generale < 8  OU  plus de la moitié des matières ont une moyenne < 10
■ "warning" → moyenne_generale >= 8 ET < 12  OU  au moins 1 matière a une moyenne < 8
■ "info" → moyenne_generale >= 12  ET  aucune matière en dessous de 8

EXEMPLES CONCRETS :
- Moyenne 10.36 avec 1+ matières faibles → "warning" (JAMAIS "info")
- Moyenne 7.5 → "danger" (JAMAIS "warning" ou "info")
- Moyenne 14.2 sans matière critique → "info"
- Moyenne 13.0 mais une matière à 6/20 → "warning"

═══════════════════════════════════════════════════════════════
RÈGLES POUR LE MESSAGE PRINCIPAL :
═══════════════════════════════════════════════════════════════

■ Si "danger" : Sois DIRECT sur la situation critique. Nomme les matières en difficulté. Encourage l'étudiant à se relever avec des actions concrètes, mais NE MINIMISE PAS les problèmes. Pas de "félicitations".
■ Si "warning" : Sois HONNÊTE. Reconnais les efforts mais pointe clairement les faiblesses. NE DIS PAS "excellentes performances" si la moyenne est sous 12/20.
■ Si "info" : Félicitations méritées et encouragements à maintenir le cap.

INTERDICTIONS ABSOLUES :
- NE DIS JAMAIS "excellentes performances" ou "félicitations" si moyenne < 12/20
- NE LAISSE JAMAIS "matieres_prioritaires" vide s'il existe des matières dans "matieres_faibles"
- N'IGNORE JAMAIS les matières en difficulté dans ton analyse

═══════════════════════════════════════════════════════════════
INSTRUCTIONS DE RÉDACTION :
═══════════════════════════════════════════════════════════════

- Tutoie l'étudiant
- 2-3 phrases pour le message principal
- 3 à 5 conseils CONCRETS et actionnables (pas de généralités comme "travaille plus")
- Liste les matières urgentes (celles dans "matieres_faibles" en priorité)
- Souligne UN point positif réel (meilleure matière, progression, taux de complétion tâches…)

RÉPONDS UNIQUEMENT en JSON valide, sans texte avant ou après :
{{
  "niveau_alerte": "info|warning|danger",
  "message_principal": "...",
  "conseils": ["...", "...", "..."],
  "matieres_prioritaires": ["...", "..."],
  "point_positif": "..."
}}"""

    async def generate_analysis(self, context: dict) -> dict:
        """Appelle le LLM Groq et retourne le JSON d'analyse validé."""
        llm = ChatGroq(
            model=settings.LLM_MODEL,
            temperature=0.3,
            max_tokens=1024,
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", "Tu es un conseiller pédagogique expert. Tu réponds TOUJOURS en JSON valide uniquement, sans texte autour."),
            ("human", self._build_prompt()),
        ])

        chain = prompt | llm | StrOutputParser()
        context_str = json.dumps(context, ensure_ascii=False, default=str)
        raw_output = await chain.ainvoke({"context_json": context_str})

        # Nettoyage robuste : extraire le JSON même si le LLM entoure de texte
        raw_output = raw_output.strip()
        if "```" in raw_output:
            parts = raw_output.split("```")
            for part in parts:
                cleaned = part.strip()
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:].strip()
                if cleaned.startswith("{"):
                    raw_output = cleaned
                    break

        # Fallback : extraire le premier objet JSON via regex
        if not raw_output.strip().startswith("{"):
            match = re.search(r'\{[\s\S]*\}', raw_output)
            if match:
                raw_output = match.group(0)

        try:
            analysis = json.loads(raw_output.strip())
        except json.JSONDecodeError as e:
            raise ValueError(f"Le LLM a retourné un JSON invalide : {e}")

        # Validation contre le schéma Pydantic (corrige les valeurs invalides)
        validated = AnalysisResult(**analysis)
        return validated.model_dump()

    # ─── Point d'entrée principal ─────────────────────────────────────────────

    async def analyze_student(self, student_id: int) -> dict:
        """
        Analyse complète d'un étudiant.
        Retourne { "analysis": {...}, "context": {...} } ou lève une exception.
        """
        raw_data = await self._fetch_student_data(student_id)

        if not raw_data:
            raise ValueError(f"Étudiant introuvable (id={student_id})")

        context = self._compute_context(raw_data)
        analysis = await self.generate_analysis(context)

        return {
            "analysis": analysis,
            "context": context,
        }


# Singleton
student_analyzer = StudentAnalyzer()
