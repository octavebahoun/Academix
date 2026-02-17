from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class SummaryLevel(str, Enum):
    short = "short"
    medium = "medium"
    detailed = "detailed"


class SummaryStyle(str, Enum):
    bullets = "bullets"
    narrative = "narrative"
    schema = "schema"


class SummaryFormat(str, Enum):
    markdown = "markdown"
    json = "json"


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


# SUMMARY SCHEMAS

class SummaryRequest(BaseModel):
    level: SummaryLevel = Field(default=SummaryLevel.medium, description="Niveau de détail")
    style: SummaryStyle = Field(default=SummaryStyle.bullets, description="Style de rédaction")
    format: SummaryFormat = Field(default=SummaryFormat.markdown, description="Format de sortie")
    matiere: Optional[str] = Field(default=None, description="Matière du cours")


class SummaryResponse(BaseModel):
    summary_id: str
    title: str
    content: str
    keywords: List[str]
    word_count: int
    format: str
    download_url: Optional[str] = None


# QUIZ SCHEMAS

class QuizDifficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"


class Question(BaseModel):
    question: str
    options: List[str]
    correct_index: int = Field(description="Index de la bonne réponse (0-3)")
    explanation: str = Field(description="Explication de la réponse")
    difficulty: str = Field(default="medium")


class QuizResponse(BaseModel):
    quiz_id: str
    title: str
    questions: List[Question]
    nb_questions: int
    difficulty: str
    matiere: Optional[str] = None


class QuizCorrectionRequest(BaseModel):
    quiz_id: str
    answers: List[int] = Field(description="Liste des index de réponses de l'étudiant")


class QuestionResult(BaseModel):
    question: str
    student_answer: int
    correct_answer: int
    is_correct: bool
    explanation: str


class CorrectionResponse(BaseModel):
    quiz_id: str
    score: int
    total: int
    percentage: float
    details: List[QuestionResult]


# EXERCISE SCHEMAS

class ExerciseDifficulty(str, Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"
    progressive = "progressive"


class Exercise(BaseModel):
    numero: int
    enonce: str
    difficulty: str
    indice: str = Field(default="", description="Indice pour aider l'étudiant")
    correction: str = Field(description="Correction détaillée")
    points_cles: List[str] = Field(default=[], description="Points pédagogiques")


class ExerciseResponse(BaseModel):
    exercise_id: str
    title: str
    matiere: Optional[str] = None
    chapitre: Optional[str] = None
    exercises: List[Exercise]
    nb_exercises: int
    difficulty: str
    download_url: Optional[str] = None