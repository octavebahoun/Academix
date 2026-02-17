import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from app.core.config import settings
from app.services.quiz_generator import quiz_generator
from app.models.schemas import (
    QuizResponse, QuizDifficulty, 
    QuizCorrectionRequest, CorrectionResponse
)

router = APIRouter()


@router.post("/generate", response_model=QuizResponse)
async def generate_quiz_endpoint(
    file: UploadFile = File(...),
    nb_questions: int = Query(default=10, ge=5, le=20, description="Nombre de questions (5-20)"),
    difficulty: QuizDifficulty = Query(default=QuizDifficulty.medium, description="Difficulté"),
    matiere: str = Query(default=None, description="Matière du cours")
):
    """
    Génère un quiz QCM depuis un fichier PDF ou TXT.
    
    - **file**: Fichier PDF ou TXT du cours
    - **nb_questions**: Nombre de questions (5 à 20)
    - **difficulty**: easy | medium | hard
    - **matiere**: Nom de la matière (optionnel)
    """
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Le nom du fichier est manquant")
        
        # Vérification extension
        allowed_extensions = ['.pdf', '.txt', '.md']
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Extension non supportée. Utilisez: {', '.join(allowed_extensions)}"
            )
        
        # Sauvegarde temporaire
        temp_file_path = os.path.join(settings.UPLOAD_DIR, f"quiz_temp_{file.filename}")
        
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Génération du quiz
        result = await quiz_generator.generate_quiz(
            file_path=temp_file_path,
            nb_questions=nb_questions,
            difficulty=difficulty.value,
            matiere=matiere
        )
        
        # Nettoyage
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        
        return QuizResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du quiz: {str(e)}")


@router.post("/correct", response_model=CorrectionResponse)
async def correct_quiz_endpoint(correction: QuizCorrectionRequest):
    """
    Corrige un quiz à partir des réponses de l'étudiant.
    
    - **quiz_id**: ID du quiz à corriger
    - **answers**: Liste des index de réponses [0, 2, 1, 3, ...]
    """
    result = await quiz_generator.correct_quiz(
        quiz_id=correction.quiz_id,
        student_answers=correction.answers
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Quiz introuvable")
    
    return CorrectionResponse(**result)


@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz_endpoint(quiz_id: str):
    """
    Récupère un quiz existant par son ID.
    """
    result = await quiz_generator.get_quiz(quiz_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Quiz introuvable")
    
    return QuizResponse(**result)
