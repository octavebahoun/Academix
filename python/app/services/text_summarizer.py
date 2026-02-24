import os
import json
import uuid
from datetime import datetime
from typing import Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from app.core.config import settings


class TextSummarizer:
    """Service de génération de fiches de révision IA"""
    
    def __init__(self):
        self.output_dir = settings.SUMMARY_OUTPUT_DIR
        
        # Configuration du modèle Groq
        if settings.GROQ_API_KEY:
            os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
    
    def _build_prompt(self, level: str, style: str, matiere: Optional[str] = None) -> str:
        """Construit le prompt selon le niveau et le style demandé"""
        
        # Définition des niveaux de détail
        word_limits = {
            "short": "300-500 mots",
            "medium": "700-1000 mots",
            "detailed": "1500-2000 mots"
        }
        
        # Instructions de style
        style_instructions = {
            "bullets": "Utilise principalement des listes à puces et des points clés",
            "narrative": "Rédige de manière narrative et fluide, en paragraphes",
            "schema": "Structure sous forme de schémas conceptuels avec hiérarchies",
            "qa": "Structure sous forme de questions et réponses (Q&A) pour faciliter la mémorisation"
        }
        
        matiere_context = f"\nMatière: {matiere}" if matiere else ""
        
        prompt = f"""Tu es un expert en pédagogie et en synthèse de cours académiques.

MISSION:
Transforme le cours ci-dessous en une fiche de révision structurée et efficace.{matiere_context}

CONTRAINTES:
- Longueur: {word_limits.get(level, '700-1000 mots')}
- Niveau de détail: {level}
- Style: {style_instructions.get(style, 'Structure claire')}
- Format: Markdown strict
- Langue: Français académique

STRUCTURE OBLIGATOIRE:

# 📖 [Titre du Chapitre]

## 🎯 Objectifs d'apprentissage
- [3-5 objectifs clairs]

## 📝 Résumé
[Synthèse globale du chapitre en 150-200 mots]

## 🔑 Concepts Clés
- **Concept 1**: Définition courte et claire
- **Concept 2**: Définition courte et claire
[5-8 concepts maximum]

## 💡 Points Importants
1. [Formules, théorèmes, dates clés]
2. [Points essentiels à mémoriser]
3. [Exemples types]

## 🔍 Mots-Clés
`terme1` `terme2` `terme3` `terme4` `terme5`

## 📊 Schéma de Synthèse
[Représentation textuelle du concept principal]

## ✅ Pour aller plus loin
- [Ressources ou exercices recommandés]

COURS À SYNTHÉTISER:
{{document_content}}

GÉNÈRE LA FICHE DE RÉVISION:
"""
        return prompt
    
    async def generate_summary(
        self,
        file_path: str,
        level: str = "medium",
        style: str = "bullets",
        format_output: str = "markdown",
        matiere: Optional[str] = None
    ) -> dict:
        """
        Génère une fiche de révision depuis un fichier PDF ou TXT
        
        Args:
            file_path: Chemin du fichier à traiter
            level: Niveau de détail (short/medium/detailed)
            style: Style de rédaction (bullets/narrative/schema)
            format_output: Format de sortie (markdown/json)
            matiere: Matière du cours (optionnel)
        
        Returns:
            dict avec summary_id, title, content, keywords, etc.
        """
        
        # 1. Charger le document
        if file_path.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        else:
            loader = TextLoader(file_path, encoding="utf-8")
        
        documents = loader.load()
        document_text = "\n\n".join([doc.page_content for doc in documents])
        
        # 2. Construire le prompt
        prompt_template = self._build_prompt(level, style, matiere)
        prompt = ChatPromptTemplate.from_template(prompt_template)
        
        # 3. Configurer le LLM Groq avec Llama 4 Scout
        llm = ChatGroq(
            model=settings.SUMMARY_MODEL,
            temperature=0.3,  # Un peu de créativité pour la synthèse
            max_tokens=4096
        )
        
        # 4. Créer la chaîne LangChain
        chain = prompt | llm | StrOutputParser()
        
        # 5. Générer la fiche
        summary_content = chain.invoke({"document_content": document_text})
        
        # 6. Extraire les métadonnées
        title = self._extract_title(summary_content)
        keywords = self._extract_keywords(summary_content)
        word_count = len(summary_content.split())
        
        # 7. Créer un ID unique
        summary_id = str(uuid.uuid4())
        
        # 8. Sauvegarder la fiche
        summary_data = {
            "summary_id": summary_id,
            "title": title,
            "content": summary_content,
            "keywords": keywords,
            "word_count": word_count,
            "level": level,
            "style": style,
            "format": format_output,
            "matiere": matiere,
            "created_at": datetime.now().isoformat(),
            "source_file": os.path.basename(file_path)
        }
        
        # Sauvegarder en JSON
        output_path = os.path.join(self.output_dir, f"{summary_id}.json")
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(summary_data, f, ensure_ascii=False, indent=2)
        
        # Sauvegarder le markdown
        md_path = os.path.join(self.output_dir, f"{summary_id}.md")
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(summary_content)
        
        return {
            "summary_id": summary_id,
            "title": title,
            "content": summary_content,
            "keywords": keywords,
            "word_count": word_count,
            "format": format_output,
            "download_url": f"/api/v1/summary/download/{summary_id}"
        }
    
    def _extract_title(self, content: str) -> str:
        """Extrait le titre principal de la fiche"""
        lines = content.split("\n")
        for line in lines:
            if line.startswith("# "):
                return line.replace("# ", "").replace("📖", "").strip()
        return "Fiche de révision"
    
    def _extract_keywords(self, content: str) -> list:
        """Extrait les mots-clés de la section dédiée"""
        keywords = []
        lines = content.split("\n")
        in_keywords_section = False
        
        for line in lines:
            if "🔍 Mots-Clés" in line or "Mots-clés" in line.lower():
                in_keywords_section = True
                continue
            
            if in_keywords_section:
                if line.startswith("#"):  # Nouvelle section
                    break
                # Extraire les mots entre backticks
                import re
                found = re.findall(r'`([^`]+)`', line)
                keywords.extend(found)
        
        return keywords[:15]  # Limiter à 15 mots-clés
    
    async def get_summary(self, summary_id: str) -> Optional[dict]:
        """Récupère une fiche existante par son ID"""
        file_path = os.path.join(self.output_dir, f"{summary_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def get_markdown_path(self, summary_id: str) -> Optional[str]:
        """Retourne le chemin du fichier markdown"""
        md_path = os.path.join(self.output_dir, f"{summary_id}.md")
        return md_path if os.path.exists(md_path) else None


# Instance unique
text_summarizer = TextSummarizer()
