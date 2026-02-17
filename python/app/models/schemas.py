from pydantic import BaseModel
from typing import List, Optional



class ChatRequest(BaseModel):
    question: str
    # Plus tard, ajouter 'history' ici pour la mémoire conversationnelle

class ChatResponse(BaseModel):
    answer: str
    sources: List[str] = []  # Pour afficher les sources utilisées 

#  UPLOAD SCHEMAS 

class FileUploadResponse(BaseModel):
    filename: str
    chunks: int
    message: str