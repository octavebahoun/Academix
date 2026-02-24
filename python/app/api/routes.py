import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Body, Depends
from app.core.config import settings
from app.services.rag_service import rag_service
from app.models.schemas import ChatRequest, ChatResponse, FileUploadResponse
from app.api.dependencies import get_current_user

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, current_user: dict = Depends(get_current_user)):

    try:
        # On appelle le service RAG 
        answer_text = await rag_service.ask_question(request.question, request.history)
        
        # On renvoie la réponse formatée
        return ChatResponse(
            answer=answer_text,
            sources=[] # Octave implémenter les sources plus tard
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload", response_model=FileUploadResponse)
async def upload_endpoint(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """
    Route pour uploader un fichier PDF ou TXT.
    Le fichier est sauvegardé puis indexé par le RAG.
    """
    try:
        # Vérification du nom de fichier
        if not file.filename:
            raise HTTPException(status_code=400, detail="Le nom du fichier est manquant")
        
        # 1. Définir le chemin de sauvegarde
        file_location = os.path.join(settings.UPLOAD_DIR, file.filename)
        
        # 2. Sauvegarder le fichier physiquement sur le disque
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 3. Demander au service RAG d'ingérer ce fichier
        chunk_count = await rag_service.ingest_file(file_location)
        
        return FileUploadResponse(
            filename=file.filename,
            chunks=chunk_count,
            message="Fichier traité et ajouté à la mémoire de l'IA avec succès."
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur d'upload : {str(e)}")