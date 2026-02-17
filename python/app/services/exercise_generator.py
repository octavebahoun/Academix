import os
import json
import uuid
import re
from datetime import datetime
from typing import Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from app.core.config import settings


class ExerciseGenerator:
    """Service de génération d'exercices pédagogiques via IA (Qwen3-32B)"""
    
    def __init__(self):
        self.output_dir = settings.EXERCISE_OUTPUT_DIR
        
        if settings.GROQ_API_KEY:
            os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
    
    def _build_prompt(
        self,
        nb_exercises: int,
        difficulty: str,
        matiere: Optional[str] = None,
        chapitre: Optional[str] = None
    ) -> str:
        """Construit le prompt pour générer des exercices"""
        
        difficulty_instructions = {
            "easy": "Exercices d'application directe, rappels de cours, calculs simples. Niveau débutant.",
            "medium": "Exercices d'application avec raisonnement, problèmes à étapes. Niveau intermédiaire.",
            "hard": "Exercices complexes, démonstrations, problèmes ouverts, synthèse. Niveau avancé.",
            "progressive": f"Génère {nb_exercises} exercices de difficulté croissante : les premiers faciles, les derniers difficiles."
        }
        
        matiere_ctx = f"\nMatière: {matiere}" if matiere else ""
        chapitre_ctx = f"\nChapitre: {chapitre}" if chapitre else ""
        
        prompt = f"""Tu es un professeur universitaire expert en création d'exercices pédagogiques.{matiere_ctx}{chapitre_ctx}

MISSION:
Génère exactement {nb_exercises} exercices à partir du cours ci-dessous.

DIFFICULTÉ: {difficulty}
{difficulty_instructions.get(difficulty, difficulty_instructions['medium'])}

RÈGLES:
1. Chaque exercice doit avoir un énoncé clair et complet
2. Chaque exercice doit avoir un indice pour aider l'étudiant
3. Chaque exercice doit avoir une correction DÉTAILLÉE étape par étape
4. Chaque exercice doit lister 2-3 points pédagogiques clés
5. Les exercices doivent couvrir différents aspects du cours
6. Les énoncés doivent être autonomes (compréhensibles sans le cours)

FORMAT DE SORTIE OBLIGATOIRE (JSON STRICT):
Retourne UNIQUEMENT un JSON valide, sans texte avant ou après.

```json
{{{{
  "title": "Exercices - [Sujet du cours]",
  "exercises": [
    {{{{
      "numero": 1,
      "enonce": "Énoncé complet de l'exercice...",
      "difficulty": "easy",
      "indice": "Un indice pour guider l'étudiant...",
      "correction": "Correction détaillée étape par étape:\\n1. Première étape...\\n2. Deuxième étape...\\nRéponse finale: ...",
      "points_cles": ["Point pédagogique 1", "Point pédagogique 2"]
    }}}}
  ]
}}}}
```

IMPORTANT:
- Retourne UNIQUEMENT le JSON, rien d'autre
- Les corrections doivent être détaillées et pédagogiques
- Adapte le vocabulaire et la complexité au niveau demandé

COURS À ANALYSER:
{{document_content}}

JSON DES EXERCICES:"""
        
        return prompt
    
    async def generate_exercises(
        self,
        file_path: str,
        nb_exercises: int = 5,
        difficulty: str = "progressive",
        matiere: Optional[str] = None,
        chapitre: Optional[str] = None
    ) -> dict:
        """
        Génère des exercices depuis un fichier PDF ou TXT
        
        Args:
            file_path: Chemin du fichier source
            nb_exercises: Nombre d'exercices (3-15)
            difficulty: easy/medium/hard/progressive
            matiere: Matière du cours (optionnel)
            chapitre: Chapitre spécifique (optionnel)
        
        Returns:
            dict avec exercise_id, title, exercises, etc.
        """
        
        # 1. Charger le document
        if file_path.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        else:
            loader = TextLoader(file_path, encoding="utf-8")
        
        documents = loader.load()
        document_text = "\n\n".join([doc.page_content for doc in documents])
        
        # Limiter le texte
        max_chars = 15000
        if len(document_text) > max_chars:
            document_text = document_text[:max_chars]
        
        # 2. Construire le prompt
        prompt_template = self._build_prompt(nb_exercises, difficulty, matiere, chapitre)
        prompt = ChatPromptTemplate.from_template(prompt_template)
        
        # 3. Configurer Groq avec Qwen3-32B
        llm = ChatGroq(
            model=settings.EXERCISE_MODEL,
            temperature=0.5,
            max_tokens=8192
        )
        
        # 4. Générer les exercices
        chain = prompt | llm | StrOutputParser()
        raw_response = chain.invoke({"document_content": document_text})
        
        # 5. Parser le JSON
        exercise_data = self._parse_json(raw_response)
        
        # 6. Valider les exercices
        exercises = self._validate_exercises(exercise_data.get("exercises", []))
        title = exercise_data.get("title", "Exercices générés")
        
        # 7. Créer un ID unique
        exercise_id = str(uuid.uuid4())
        
        # 8. Construire la réponse
        result = {
            "exercise_id": exercise_id,
            "title": title,
            "matiere": matiere,
            "chapitre": chapitre,
            "exercises": exercises,
            "nb_exercises": len(exercises),
            "difficulty": difficulty,
            "created_at": datetime.now().isoformat(),
            "source_file": os.path.basename(file_path)
        }
        
        # 9. Sauvegarder
        output_path = os.path.join(self.output_dir, f"{exercise_id}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        # Sauvegarder aussi en markdown
        md_content = self._to_markdown(result)
        md_path = os.path.join(self.output_dir, f"{exercise_id}.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(md_content)
        
        result["download_url"] = f"/api/v1/exercises/download/{exercise_id}"
        return result
    
    def _parse_json(self, raw_response: str) -> dict:
        """Parse le JSON depuis la réponse de l'IA"""
        cleaned = raw_response
        
        # Retirer le bloc thinking de Qwen si présent
        if "<think>" in cleaned:
            cleaned = re.sub(r'<think>.*?</think>', '', cleaned, flags=re.DOTALL)
        
        # Chercher le bloc json
        json_match = re.search(r'```json\s*(.*?)\s*```', cleaned, re.DOTALL)
        if json_match:
            cleaned = json_match.group(1)
        else:
            json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if json_match:
                cleaned = json_match.group(0)
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            cleaned = cleaned.strip()
            cleaned = re.sub(r',\s*}', '}', cleaned)
            cleaned = re.sub(r',\s*]', ']', cleaned)
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                return {"title": "Exercices", "exercises": []}
    
    def _validate_exercises(self, exercises: list) -> list:
        """Valide et corrige les exercices"""
        valid = []
        
        for i, ex in enumerate(exercises):
            if not isinstance(ex, dict):
                continue
            if not ex.get("enonce"):
                continue
            
            valid.append({
                "numero": ex.get("numero", i + 1),
                "enonce": ex["enonce"],
                "difficulty": ex.get("difficulty", "medium"),
                "indice": ex.get("indice", "Relisez attentivement le cours."),
                "correction": ex.get("correction", "Correction non disponible."),
                "points_cles": ex.get("points_cles", [])
            })
        
        return valid
    
    def _to_markdown(self, result: dict) -> str:
        """Convertit les exercices en markdown"""
        md = f"# 📝 {result['title']}\n\n"
        
        if result.get("matiere"):
            md += f"**Matière**: {result['matiere']}\n"
        if result.get("chapitre"):
            md += f"**Chapitre**: {result['chapitre']}\n"
        md += f"**Difficulté**: {result['difficulty']}\n"
        md += f"**Nombre d'exercices**: {result['nb_exercises']}\n\n"
        md += "---\n\n"
        
        for ex in result["exercises"]:
            md += f"## Exercice {ex['numero']} ({ex['difficulty']})\n\n"
            md += f"### Énoncé\n{ex['enonce']}\n\n"
            md += f"### 💡 Indice\n{ex['indice']}\n\n"
            md += f"### ✅ Correction\n{ex['correction']}\n\n"
            if ex.get("points_cles"):
                md += "### 🎯 Points clés\n"
                for pt in ex["points_cles"]:
                    md += f"- {pt}\n"
            md += "\n---\n\n"
        
        return md
    
    async def get_exercises(self, exercise_id: str) -> Optional[dict]:
        """Récupère des exercices existants par ID"""
        file_path = os.path.join(self.output_dir, f"{exercise_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def get_markdown_path(self, exercise_id: str) -> Optional[str]:
        """Retourne le chemin du fichier markdown"""
        md_path = os.path.join(self.output_dir, f"{exercise_id}.md")
        return md_path if os.path.exists(md_path) else None


# Instance unique
exercise_generator = ExerciseGenerator()
