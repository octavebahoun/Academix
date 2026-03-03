import logging
from fastapi import APIRouter, HTTPException, Depends
from app.services.student_analyzer import student_analyzer
from app.api.dependencies import get_current_user
from app.models.schemas import StudentAnalysisResponse

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{student_id}", response_model=StudentAnalysisResponse)
async def analyze_student_endpoint(
    student_id: int,
    current_user: dict = Depends(get_current_user),
):
    """
    Analyse IA complète d'un étudiant.

    Appelé par le service Laravel qui transmet le Bearer token de l'utilisateur.
    Authentification : Bearer token Sanctum (comme toutes les autres routes).

    Retourne :
    ```json
    {
      "success": true,
      "data": {
        "analysis": { "niveau_alerte": "...", "message_principal": "...", ... },
        "context":  { "moyenne_generale": 13.5, "matieres": [...], ... }
      }
    }
    ```
    """

    # Contrôle d'autorisation : un étudiant ne peut analyser que lui-même
    if current_user.get('role') == 'student' and current_user.get('id') != student_id:
        raise HTTPException(
            status_code=403,
            detail="Vous ne pouvez consulter que votre propre analyse."
        )

    try:
        result = await student_analyzer.analyze_student(student_id)
        return {"success": True, "data": result}

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur analyse IA student_id={student_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Une erreur est survenue lors de l'analyse. Veuillez réessayer.",
        )
