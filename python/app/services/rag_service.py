import os
import shutil
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import settings

class RagService:
    def __init__(self):
        self.vector_store = None
        self.chain = None
        # 1. On charge le modèle d'embedding (transforme le texte en maths)
        self.embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
        
        # 2. Si la base de données existe déjà, on la charge
        if os.path.exists(settings.CHROMA_DB_DIR):
            self.vector_store = Chroma(
                persist_directory=settings.CHROMA_DB_DIR, 
                embedding_function=self.embeddings
            )
            self._build_chain() # On prépare la chaîne de réponse

    def _build_chain(self):
        """Construit la pipeline RAG (Retriever -> Prompt -> LLM)"""
        if not self.vector_store:
            return

        # On s'assure que la clé API est dans l'environnement
        if settings.GROQ_API_KEY:
            os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY

        # On configure le cerveau (Groq)
        llm = ChatGroq(
            model=settings.LLM_MODEL, 
            temperature=0
        )
        
        # On configure le chercheur (trouve les 3 morceaux les plus pertinents)
        retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})

        # Le prompt que l'IA va recevoir
        prompt = ChatPromptTemplate.from_template("""
        Tu es un assistant pédagogique expert pour la plateforme Academix.
        Utilise les extraits de cours ci-dessous pour répondre à la question de l'étudiant.
        Si la réponse ne se trouve pas dans les extraits, dis simplement que tu ne sais pas.
        
        Contexte du cours:
        {context}
        
        Question de l'étudiant:
        {question}
        
        Réponse claire et pédagogique:
        """)

        # La chaîne LCEL (LangChain Expression Language)
        self.chain = (
            {"context": retriever, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )

    async def ingest_file(self, file_path: str):
        """
        Lit un fichier, le découpe et l'ajoute à la mémoire vectorielle.
        """
        # 1. Chargement selon le type de fichier
        if file_path.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        else:
            # Par défaut, on tente de lire comme du texte
            loader = TextLoader(file_path, encoding="utf-8")
            
        documents = loader.load()

        # 2. Découpage (Chunks)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200
        )
        chunks = text_splitter.split_documents(documents)

        # 3. Indexation dans ChromaDB
        if self.vector_store is None:
            self.vector_store = Chroma.from_documents(
                documents=chunks, 
                embedding=self.embeddings,
                persist_directory=settings.CHROMA_DB_DIR
            )
        else:
            self.vector_store.add_documents(chunks)

        # 4. On met à jour la chaîne pour qu'elle utilise les nouvelles données
        self._build_chain()
        
        return len(chunks)

    async def ask_question(self, question: str):
        """Pose une question à l'IA"""
        if not self.chain:
            return "Veuillez d'abord uploader un document de cours."
        
        return self.chain.invoke(question)

# On crée une instance unique  qu'on pourra importer partout
rag_service = RagService()