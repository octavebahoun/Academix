from fastapi import APIRouter, HTTPException, Depends
from app.services.student_analyzer import student_analyzer
from app.api.dependencies import get_current_user

router = APIRouter()


@router.get("/{student_id}")
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

    try:
        result = await student_analyzer.analyze_student(student_id)
        return {"success": True, "data": result}

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'analyse IA : {str(e)}",
        )
