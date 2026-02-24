from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as api_router
from app.api.summary_routes import router as summary_router
from app.api.quiz_routes import router as quiz_router
from app.api.exercise_routes import router as exercise_router
from app.api.image_routes import router as image_router
from app.api.podcast_routes import router as podcast_router
from app.core.config import settings

# Création de l'application FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend Academix - Intelligence Artificielle Éducative"
)

# Configuration CORS (Indispensable pour que le Frontend puisse parler à l'API)
# allow_origins=["*"] permet à tout le monde de se connecter (Utile en mode dev/hackathon)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1", tags=["RAG Service"])
app.include_router(summary_router, prefix="/api/v1/summary", tags=["Summary Service"])
app.include_router(quiz_router, prefix="/api/v1/quiz", tags=["Quiz Service"])
app.include_router(exercise_router, prefix="/api/v1/exercises", tags=["Exercise Service"])
app.include_router(image_router, prefix="/api/v1/image", tags=["Image Generation"])
app.include_router(podcast_router, prefix="/api/v1/podcast", tags=["Podcast Service"])

@app.get("/")
def root():
    return {"status": "online", "message": "Bienvenue sur l'API Academix AI"}

# Permet de lancer avec "python main.py"
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.API_HOST, port=settings.API_PORT, reload=settings.API_RELOAD)