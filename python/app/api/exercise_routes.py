import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from fastapi.responses import FileResponse
from app.core.config import settings
from app.services.exercise_generator import exercise_generator
from app.models.schemas import ExerciseResponse, ExerciseDifficulty
from app.api.dependencies import get_current_user

router = APIRouter()


@router.post("/generate", response_model=ExerciseResponse)
async def generate_exercises_endpoint(
    file: UploadFile = File(...),
    nb_exercises: int = Query(default=5, ge=3, le=15, description="Nombre d'exercices (3-15)"),
    difficulty: ExerciseDifficulty = Query(default=ExerciseDifficulty.progressive, description="Difficulté"),
    matiere: str = Query(default=None, description="Matière du cours"),
    chapitre: str = Query(default=None, description="Chapitre spécifique"),
    current_user: dict = Depends(get_current_user)
):
    """
    Génère des exercices avec corrections depuis un fichier PDF ou TXT.
    
    - **file**: Fichier PDF ou TXT du cours
    - **nb_exercises**: Nombre d'exercices (3 à 15)
    - **difficulty**: easy | medium | hard | progressive (difficulté croissante)
    - **matiere**: Nom de la matière (optionnel)
    - **chapitre**: Nom du chapitre (optionnel)
    """
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Le nom du fichier est manquant")
        
        allowed_extensions = ['.pdf', '.txt', '.md']
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Extension non supportée. Utilisez: {', '.join(allowed_extensions)}"
            )
        
        # Sauvegarde temporaire
        temp_file_path = os.path.join(settings.UPLOAD_DIR, f"exo_temp_{file.filename}")
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Génération
        result = await exercise_generator.generate_exercises(
            file_path=temp_file_path,
            nb_exercises=nb_exercises,
            difficulty=difficulty.value,
            matiere=matiere,
            chapitre=chapitre
        )
        
        # Nettoyage
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
        return ExerciseResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")


@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercises_endpoint(exercise_id: str, current_user: dict = Depends(get_current_user)):
    """Récupère des exercices existants par ID."""
    result = await exercise_generator.get_exercises(exercise_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Exercices introuvables")
    
    return ExerciseResponse(
        exercise_id=result["exercise_id"],
        title=result["title"],
        matiere=result.get("matiere"),
        chapitre=result.get("chapitre"),
        exercises=result["exercises"],
        nb_exercises=result["nb_exercises"],
        difficulty=result["difficulty"],
        download_url=f"/api/v1/exercises/download/{exercise_id}"
    )


@router.get("/download/{exercise_id}")
async def download_exercises_endpoint(exercise_id: str, current_user: dict = Depends(get_current_user)):
    """Télécharge les exercices en format markdown."""
    md_path = exercise_generator.get_markdown_path(exercise_id)
    
    if not md_path or not os.path.exists(md_path):
        raise HTTPException(status_code=404, detail="Fichier markdown introuvable")
    
    return FileResponse(
        path=md_path,
        media_type="text/markdown",
        filename=f"exercices_{exercise_id}.md"
    )
