import os
import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from gtts import gTTS
from app.core.config import settings
from app.api.dependencies import get_current_user
from langchain_community.document_loaders import PyPDFLoader, TextLoader

router = APIRouter()

PODCAST_DIR = os.path.join(settings.GENERATED_DIR, "podcasts")
os.makedirs(PODCAST_DIR, exist_ok=True)

@router.post("/generate")
async def generate_podcast_endpoint(
    file: UploadFile = File(...),
):
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Fichier manquant")
            
        temp_path = os.path.join(settings.UPLOAD_DIR, f"temp_podcast_{file.filename}")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Extract text
        if temp_path.endswith(".pdf"):
            loader = PyPDFLoader(temp_path)
            docs = loader.load()
            text = " ".join([d.page_content for d in docs])
        else:
            loader = TextLoader(temp_path, encoding="utf-8")
            docs = loader.load()
            text = docs[0].page_content
            
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        # Summarize for podcast if it's too long (optional mock text for now)
        # Using a small chunk to not spend 10 minutes on TTS
        short_text = "Bienvenue dans votre podcast de révision AcademiX. Voici les points essentiels de votre cours. " + text[:500] + "... Fin du résumé."
        
        # Generate Audio with gTTS
        tts = gTTS(text=short_text, lang="fr", slow=False)
        podcast_id = str(uuid.uuid4())
        audio_path = os.path.join(PODCAST_DIR, f"{podcast_id}.mp3")
        tts.save(audio_path)
        
        return {
            "podcast_id": podcast_id,
            "filename": file.filename,
            "url": f"/podcast/download/{podcast_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download/{podcast_id}")
async def download_podcast(podcast_id: str):
    audio_path = os.path.join(PODCAST_DIR, f"{podcast_id}.mp3")
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Podcast non trouvé")
    return FileResponse(audio_path, media_type="audio/mpeg", filename=f"podcast_{podcast_id}.mp3")
