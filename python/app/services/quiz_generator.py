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


class QuizGenerator:
    """Service de génération de Quiz QCM via IA (Qwen3-32B)"""
    
    def __init__(self):
        self.output_dir = settings.QUIZ_OUTPUT_DIR
        
        if settings.GROQ_API_KEY:
            os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
    
    def _build_prompt(self, nb_questions: int, difficulty: str, matiere: Optional[str] = None) -> str:
        """Construit le prompt pour générer un quiz QCM"""
        
        difficulty_instructions = {
            "easy": "Questions de compréhension basique, définitions, concepts fondamentaux. Niveau débutant.",
            "medium": "Questions d'application, liens entre concepts, cas pratiques. Niveau intermédiaire.",
            "hard": "Questions d'analyse, synthèse, cas complexes, pièges courants. Niveau avancé."
        }
        
        matiere_context = f"\nMatière: {matiere}" if matiere else ""
        
        prompt = f"""Tu es un enseignant expert en création de QCM pédagogiques.{matiere_context}

MISSION:
Génère exactement {nb_questions} questions QCM à partir du cours ci-dessous.

DIFFICULTÉ: {difficulty}
{difficulty_instructions.get(difficulty, difficulty_instructions['medium'])}

RÈGLES STRICTES:
1. Chaque question a EXACTEMENT 4 options (A, B, C, D)
2. UNE SEULE bonne réponse par question
3. Les distracteurs (mauvaises réponses) doivent être plausibles
4. Chaque explication doit être pédagogique (2-3 phrases)
5. Les questions doivent couvrir différents aspects du cours
6. Pas de questions ambiguës

FORMAT DE SORTIE OBLIGATOIRE (JSON STRICT):
Tu dois retourner UNIQUEMENT un JSON valide, sans texte avant ou après.

```json
{{{{
  "title": "Quiz - [Sujet principal du cours]",
  "questions": [
    {{{{
      "question": "Texte de la question ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Explication pédagogique de la bonne réponse.",
      "difficulty": "{difficulty}"
    }}}}
  ]
}}}}
```

IMPORTANT: 
- correct_index est un entier de 0 à 3 (0=A, 1=B, 2=C, 3=D)
- Retourne UNIQUEMENT le JSON, rien d'autre
- Pas de commentaires, pas de texte explicatif autour du JSON

COURS À ANALYSER:
{{document_content}}

JSON DU QUIZ:"""
        
        return prompt
    
    async def generate_quiz(
        self,
        file_path: str,
        nb_questions: int = 10,
        difficulty: str = "medium",
        matiere: Optional[str] = None
    ) -> dict:
        """
        Génère un quiz QCM depuis un fichier PDF ou TXT
        
        Args:
            file_path: Chemin du fichier source
            nb_questions: Nombre de questions (5-20)
            difficulty: easy/medium/hard
            matiere: Matière du cours (optionnel)
        
        Returns:
            dict avec quiz_id, title, questions, etc.
        """
        
        # 1. Charger le document
        if file_path.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        else:
            loader = TextLoader(file_path, encoding="utf-8")
        
        documents = loader.load()
        document_text = "\n\n".join([doc.page_content for doc in documents])
        
        # Limiter le texte pour ne pas dépasser le contexte
        max_chars = 15000
        if len(document_text) > max_chars:
            document_text = document_text[:max_chars]
        
        # 2. Construire le prompt
        prompt_template = self._build_prompt(nb_questions, difficulty, matiere)
        prompt = ChatPromptTemplate.from_template(prompt_template)
        
        # 3. Configurer Groq avec Qwen3-32B (meilleur pour le raisonnement)
        llm = ChatGroq(
            model=settings.QUIZ_MODEL,
            temperature=0.4,
            max_tokens=8192
        )
        
        # 4. Générer le quiz
        chain = prompt | llm | StrOutputParser()
        raw_response = chain.invoke({"document_content": document_text})
        
        # 5. Parser le JSON de la réponse
        quiz_data = self._parse_quiz_json(raw_response)
        
        # 6. Valider et corriger les données
        questions = self._validate_questions(quiz_data.get("questions", []))
        title = quiz_data.get("title", "Quiz généré")
        
        # 7. Créer un ID unique
        quiz_id = str(uuid.uuid4())
        
        # 8. Construire la réponse
        quiz_result = {
            "quiz_id": quiz_id,
            "title": title,
            "questions": questions,
            "nb_questions": len(questions),
            "difficulty": difficulty,
            "matiere": matiere,
            "created_at": datetime.now().isoformat(),
            "source_file": os.path.basename(file_path)
        }
        
        # 9. Sauvegarder le quiz
        output_path = os.path.join(self.output_dir, f"{quiz_id}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(quiz_result, f, ensure_ascii=False, indent=2)
        
        return quiz_result
    
    def _parse_quiz_json(self, raw_response: str) -> dict:
        """Parse le JSON depuis la réponse de l'IA"""
        
        # Nettoyer la réponse : retirer le bloc thinking de Qwen si présent
        cleaned = raw_response
        if "<think>" in cleaned:
            cleaned = re.sub(r'<think>.*?</think>', '', cleaned, flags=re.DOTALL)
        
        # Chercher le JSON dans la réponse
        # Essayer d'abord le bloc ```json ... ```
        json_match = re.search(r'```json\s*(.*?)\s*```', cleaned, re.DOTALL)
        if json_match:
            cleaned = json_match.group(1)
        else:
            # Essayer de trouver le premier { ... } complet
            json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
            if json_match:
                cleaned = json_match.group(0)
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Dernière tentative : nettoyer les caractères problématiques
            cleaned = cleaned.strip()
            cleaned = re.sub(r',\s*}', '}', cleaned)  # Virgule trailing
            cleaned = re.sub(r',\s*]', ']', cleaned)  # Virgule trailing
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                return {"title": "Quiz", "questions": []}
    
    def _validate_questions(self, questions: list) -> list:
        """Valide et corrige les questions"""
        valid_questions = []
        
        for q in questions:
            # Vérifications minimales
            if not isinstance(q, dict):
                continue
            if not q.get("question"):
                continue
            if not isinstance(q.get("options"), list) or len(q.get("options", [])) != 4:
                continue
            
            # Corriger correct_index
            correct_idx = q.get("correct_index", 0)
            if not isinstance(correct_idx, int) or correct_idx < 0 or correct_idx > 3:
                correct_idx = 0
            
            valid_questions.append({
                "question": q["question"],
                "options": q["options"][:4],
                "correct_index": correct_idx,
                "explanation": q.get("explanation", "Pas d'explication disponible."),
                "difficulty": q.get("difficulty", "medium")
            })
        
        return valid_questions
    
    async def correct_quiz(self, quiz_id: str, student_answers: list) -> Optional[dict]:
        """
        Corrige un quiz à partir des réponses de l'étudiant
        
        Args:
            quiz_id: ID du quiz
            student_answers: Liste des index de réponses [0, 2, 1, 3, ...]
        
        Returns:
            dict avec score, total, percentage, details
        """
        # Charger le quiz
        quiz = await self.get_quiz(quiz_id)
        if not quiz:
            return None
        
        questions = quiz["questions"]
        score = 0
        details = []
        
        for i, question in enumerate(questions):
            student_answer = student_answers[i] if i < len(student_answers) else -1
            is_correct = student_answer == question["correct_index"]
            
            if is_correct:
                score += 1
            
            details.append({
                "question": question["question"],
                "student_answer": student_answer,
                "correct_answer": question["correct_index"],
                "is_correct": is_correct,
                "explanation": question["explanation"]
            })
        
        total = len(questions)
        percentage = round((score / total) * 100, 1) if total > 0 else 0.0
        
        return {
            "quiz_id": quiz_id,
            "score": score,
            "total": total,
            "percentage": percentage,
            "details": details
        }
    
    async def get_quiz(self, quiz_id: str) -> Optional[dict]:
        """Récupère un quiz existant par son ID"""
        file_path = os.path.join(self.output_dir, f"{quiz_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)


# Instance unique
quiz_generator = QuizGenerator()
