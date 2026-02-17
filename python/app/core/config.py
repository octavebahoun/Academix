import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "Academix RAG API"
    VERSION: str = "1.0.0"
    
    # Configuration API
    API_HOST: str = Field(default="0.0.0.0")
    API_PORT: int = Field(default=8001)
    API_RELOAD: bool = Field(default=True)
    API_KEY: str = Field(default="your_secret_api_key_change_this")
    
    # Clés API - OBLIGATOIRES pour le fonctionnement
    GROQ_API_KEY: str = Field(default="")
    OPENAI_API_KEY: str = Field(default="")
    ANTHROPIC_API_KEY: str = Field(default="")
    HF_TOKEN: str = Field(default="")
    
    # Configuration uploads
    MAX_UPLOAD_SIZE: int = Field(default=10485760)  # 10MB
    ALLOWED_EXTENSIONS: str = Field(default=".pdf,.txt,.md,.docs")
    
    # Paths
    UPLOAD_DIR: str = Field(default="./uploads")
    GENERATED_DIR: str = Field(default="./generated")
    CHROMA_DB_DIR: str = Field(default="./generated/chroma_db")
    
    # Modèles
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    SUMMARY_MODEL: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    QUIZ_MODEL: str = "qwen/qwen3-32b"
    EXERCISE_MODEL: str = "qwen/qwen3-32b"
    
    # Répertoires de sortie
    SUMMARY_OUTPUT_DIR: str = Field(default="./generated/summaries")
    QUIZ_OUTPUT_DIR: str = Field(default="./generated/quizzes")
    EXERCISE_OUTPUT_DIR: str = Field(default="./generated/exercises")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,  # Important pour charger GROQ_API_KEY correctement
        extra="ignore"
    )

settings = Settings()

# Création automatique des dossiers nécessaires au démarrage
os.makedirs(settings.CHROMA_DB_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.SUMMARY_OUTPUT_DIR, exist_ok=True)
os.makedirs(settings.QUIZ_OUTPUT_DIR, exist_ok=True)
os.makedirs(settings.EXERCISE_OUTPUT_DIR, exist_ok=True)