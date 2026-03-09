from celery import Celery

from app.core.config import settings

celery_app = Celery(
    "academix",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.imports = ("app.tasks.roadmap_tasks",)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    # Timeout global par tâche : 14 min soft (signal SIGTERM) + 15 min hard (SIGKILL)
    # Empêche le blocage infini sur la transcription audio
    task_soft_time_limit=840,
    task_time_limit=900,
    # Un seul worker par tâche pour ne pas saturer les ressources
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)
