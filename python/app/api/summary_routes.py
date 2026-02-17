import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse
from app.core.config import settings
from app.services.text_summarizer import text_summarizer
from app.models.schemas import SummaryRequest, SummaryResponse, SummaryLevel, SummaryStyle, SummaryFormat

router = APIRouter()


@router.post("/generate", response_model=SummaryResponse)
async def generate_summary_endpoint(
    file: UploadFile = File(...),
    level: SummaryLevel = Query(default=SummaryLevel.medium, description="Niveau de détail"),
    style: SummaryStyle = Query(default=SummaryStyle.bullets, description="Style de rédaction"),
    format: SummaryFormat = Query(default=SummaryFormat.markdown, description="Format de sortie"),
    matiere: str = Query(default=None, description="Matière du cours")
):
    """
    Génère une fiche de révision depuis un fichier PDF ou TXT.
    
    - **file**: Fichier PDF ou TXT du cours
    - **level**: short (300-500 mots) | medium (700-1000) | detailed (1500-2000)
    - **style**: bullets (listes) | narrative (paragraphes) | schema (hiérarchique)
    - **format**: markdown | json
    - **matiere**: Nom de la matière (optionnel)
    """
    try:
        # Vérification du nom de fichier
        if not file.filename:
            raise HTTPException(status_code=400, detail="Le nom du fichier est manquant")
        
        # Vérification de l'extension
        allowed_extensions = ['.pdf', '.txt', '.md']
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Extension non supportée. Utilisez: {', '.join(allowed_extensions)}"
            )
        
        # Sauvegarde temporaire du fichier
        temp_file_path = os.path.join(settings.UPLOAD_DIR, f"temp_{file.filename}")
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Génération de la fiche
        result = await text_summarizer.generate_summary(
            file_path=temp_file_path,
            level=level.value,
            style=style.value,
            format_output=format.value,
            matiere=matiere
        )
        
        # Nettoyage du fichier temporaire
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
        return SummaryResponse(**result)
        
    except Exception as e:
        # Nettoyage en cas d'erreur
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")


@router.get("/{summary_id}", response_model=SummaryResponse)
async def get_summary_endpoint(summary_id: str):
    """
    Récupère une fiche de révision existante par son ID.
    """
    result = await text_summarizer.get_summary(summary_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Fiche de révision introuvable")
    
    return SummaryResponse(
        summary_id=result["summary_id"],
        title=result["title"],
        content=result["content"],
        keywords=result["keywords"],
        word_count=result["word_count"],
        format=result["format"],
        download_url=f"/api/v1/summary/download/{summary_id}"
    )


@router.get("/download/{summary_id}")
async def download_summary_endpoint(summary_id: str):
    """
    Télécharge le fichier markdown de la fiche de révision.
    """
    md_path = text_summarizer.get_markdown_path(summary_id)
    
    if not md_path or not os.path.exists(md_path):
        raise HTTPException(status_code=404, detail="Fichier markdown introuvable")
    
    return FileResponse(
        path=md_path,
        media_type="text/markdown",
        filename=f"fiche_revision_{summary_id}.md"
    )
