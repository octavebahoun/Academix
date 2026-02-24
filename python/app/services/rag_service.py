import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.core.config import settings

class RagService:
    def __init__(self):
        if settings.GROQ_API_KEY:
            os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
            
        self.llm = ChatGroq(
            model=settings.LLM_MODEL, 
            temperature=0.7
        )

    async def ingest_file(self, file_path: str):
        # Stub pour ne pas crasher si un doc est uploadé
        return 0

    async def ask_question(self, question: str, history=None):
        if history is None:
            history = []
            
        messages = [
            SystemMessage(content="Tu es le Professeur AcademiX. Tu aides l'étudiant avec ses cours et ses révisions. "
                                  "Tu gardes le contexte de la conversation en mémoire et réponds de manière "
                                  "pedagogique, claire, amusante et avec un formatage Markdown bien structuré.")
        ]
        
        for msg in history:
            if msg.role == "user" or msg.role == "human":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))
                
        messages.append(HumanMessage(content=question))
        
        try:
            response = await self.llm.ainvoke(messages)
            return response.content
        except Exception as e:
            return f"Je rencontre une erreur serveur : {str(e)}"

# On crée une instance unique qu'on pourra importer partout
rag_service = RagService()