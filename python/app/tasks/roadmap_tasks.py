import ast
import asyncio
import json
import os
import shutil
import tempfile
from datetime import datetime
from typing import Any, Dict, List, Optional

import requests
from celery.utils.log import get_task_logger

# youtube-transcript-api a changé les noms d'exceptions selon versions.
try:  # pragma: no cover
    from youtube_transcript_api import YouTubeTranscriptApi  # type: ignore[import-not-found]
    from youtube_transcript_api._errors import (  # type: ignore[import-not-found]
        TranscriptsDisabled,
        VideoUnavailable,
    )

    try:
        from youtube_transcript_api._errors import NoTranscriptFound as _NoTranscriptError  # type: ignore[import-not-found]
    except Exception:  # pragma: no cover
        from youtube_transcript_api._errors import NoTranscriptAvailable as _NoTranscriptError  # type: ignore[import-not-found]

    _TRANSCRIPT_EXCEPTIONS = (TranscriptsDisabled, VideoUnavailable, _NoTranscriptError)
except Exception:  # pragma: no cover
    YouTubeTranscriptApi = None
    _TRANSCRIPT_EXCEPTIONS = (Exception,)

try:
    import yt_dlp
except ImportError:  # pragma: no cover
    yt_dlp = None

try:
    import whisper
except ImportError:  # pragma: no cover
    whisper = None

from app.core.celery_app import celery_app
from app.core.config import settings
from app.models.schemas import RoadmapJobStatus
from app.services import roadmap_service

logger = get_task_logger(__name__)

MAX_YOUTUBE_RESULTS = 12
MIN_DURATION_SECONDS = 180
MAX_DURATION_SECONDS = 1800
MIN_VIEWS = 1000
MAX_VIDEO_AGE_DAYS = 365 * 5


def _safe_json_load(raw: str) -> Optional[Any]:
    if not raw:
        return None
    raw = raw.strip()
    if raw.startswith("```json"):
        raw = raw[7:]
    elif raw.startswith("```"):
        raw = raw[3:]
    if raw.endswith("```"):
        raw = raw[:-3]
    raw = raw.strip()
    
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find('{')
        end = raw.rfind('}')
        if start != -1 and end != -1:
            try:
                return json.loads(raw[start:end+1])
            except Exception:
                pass
        try:
            return ast.literal_eval(raw)
        except Exception:
            return None


def _extract_message_text(content: Any) -> str:
    if isinstance(content, list):
        parts: List[str] = []
        for part in content:
            if isinstance(part, dict):
                parts.append(part.get("text", ""))
            elif isinstance(part, str):
                parts.append(part)
        return "\n".join(parts)
    if isinstance(content, dict):
        return content.get("text", "")
    if isinstance(content, str):
        return content
    return ""


def _call_openrouter(messages: List[Dict[str, Any]], max_tokens: int = 900, temperature: float = 0.2) -> Dict[str, Any]:
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY manquante")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    model = getattr(settings, "OPENROUTER_MODEL", None) or "liquid/lfm-2.5-1.2b-thinking:free"
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=120)
    if response.status_code != 200:
        raise RuntimeError(f"OpenRouter {response.status_code}: {response.text[:300]}")
    return response.json()


def _parse_openrouter_json(raw: str) -> Optional[Dict[str, Any]]:
    content = _safe_json_load(raw)
    if isinstance(content, dict):
        return content
    return None


def _analysis_fallback(payload: Dict[str, Any]) -> Dict[str, Any]:
    base_concept = payload.get("notion") or payload.get("matiere") or "Notion clé"
    return {
        "concepts": [
            {
                "name": base_concept,
                "query": f"{base_concept} explication détaillée",
                "docs": payload.get("meta", {}).get("docs", []),
            }
        ],
        "meta": {"niveau": payload.get("niveau", "intermédiaire")},
    }


def _build_analysis_messages(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    mode = payload.get("mode", "Révision guidée")
    matiere = payload.get("matiere", "matière académique")
    notion = payload.get("notion", "concept clé")
    niveau = payload.get("niveau", "intermédiaire")
    return [
        {
            "role": "system",
            "content": "Vous êtes un tuteur IA capable de structurer des roadmaps pédagogiques.",
        },
        {
            "role": "user",
            "content": (
                f"Mode: {mode}\nMatière: {matiere}\nNotion: {notion}\nNiveau: {niveau}\n"
                "Fournissez un JSON contenant une liste de concepts ordonnés, leurs requêtes YouTube et les liens docs pertinents."
            ),
        },
    ]


def _perform_analysis(payload: Dict[str, Any]) -> Dict[str, Any]:
    try:
        messages = _build_analysis_messages(payload)
        response = _call_openrouter(messages, max_tokens=800)
        choices = response.get("choices", [])
        if choices:
            raw = _extract_message_text(choices[0].get("message", {}).get("content", ""))
            parsed = _parse_openrouter_json(raw)
            if parsed and parsed.get("concepts"):
                return parsed
    except Exception as exc:
        logger.warning("OpenRouter analyse échouée : %s", exc)
    return _analysis_fallback(payload)


def _build_resource_payload(candidate: Dict[str, Any]) -> Dict[str, Any]:
    transcript = candidate.get("transcript")
    if transcript and len(transcript) > 4000:
        transcript = transcript[:4000] + "…"
    return {
        "resource_type": "video",
        "title": candidate.get("title"),
        "url": candidate.get("url"),
        "source": "youtube",
        "thumbnail_url": candidate.get("thumbnail_url"),
        "duration_seconds": candidate.get("duration_seconds"),
        "score": candidate.get("score"),
        "level": candidate.get("level"),
        "summary": candidate.get("summary"),
        "transcript": transcript,
        "status": "done",
        "metadata": {
            "concept": candidate.get("concept"),
            "views": candidate.get("views"),
            "published_at": candidate.get("published_at"),
        },
    }


def _build_default_sections(analysis: Dict[str, Any], validated: List[Dict[str, Any]]) -> Dict[str, Any]:
    grouped: Dict[str, List[Dict[str, Any]]] = {}
    for candidate in validated:
        grouped.setdefault(candidate["concept"], []).append(candidate)

    sections = []
    for idx, (concept, videos) in enumerate(grouped.items(), start=1):
        sections.append(
            {
                "title": f"{idx}. {concept}",
                "description": f"Approche guidée pour {concept}.",
                "position": idx,
                "period_label": f"Semaine {idx}",
                "metadata": {"level": videos[0].get("level")},
                "resources": [_build_resource_payload(video) for video in videos],
            }
        )

    return {
        "sections": sections,
        "summary": f"Revue guidée créée pour {analysis.get('concepts', [{}])[0].get('name')}",
        "meta": analysis.get("meta", {}),
    }


def _parse_openrouter_sections(response: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    choices = response.get("choices", [])
    if not choices:
        return None
    message = choices[0].get("message", {})
    raw = _extract_message_text(message.get("content"))
    parsed = _parse_openrouter_json(raw)
    if not parsed or not parsed.get("sections"):
        return None
    return parsed


def _parse_iso_duration(duration: str) -> int:
    total = 0
    number = 0
    for char in duration:
        if char.isdigit():
            number = number * 10 + int(char)
        else:
            if char == "H":
                total += int(number) * 3600
            elif char == "M":
                total += int(number) * 60
            elif char == "S":
                total += int(number)
            number = 0
    return total


def _search_youtube_concept(concept: Dict[str, Any]) -> List[Dict[str, Any]]:
    if not settings.YOUTUBE_API_KEY:
        return []

    query = concept.get("query") or concept.get("name")
    search_params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": MAX_YOUTUBE_RESULTS,
        "order": "relevance",
        "relevanceLanguage": "fr",
        "key": settings.YOUTUBE_API_KEY,
    }
    search_resp = requests.get("https://www.googleapis.com/youtube/v3/search", params=search_params, timeout=30)
    if search_resp.status_code != 200:
        logger.warning("YouTube search échoué (%s)", search_resp.status_code)
        return []
    items = search_resp.json().get("items", [])
    video_ids = [item.get("id", {}).get("videoId") for item in items if item.get("id", {}).get("videoId")]
    if not video_ids:
        return []

    stats_resp = requests.get(
        "https://www.googleapis.com/youtube/v3/videos",
        params={
            "part": "snippet,contentDetails,statistics",
            "id": ",".join(video_ids),
            "key": settings.YOUTUBE_API_KEY,
        },
        timeout=30,
    )
    if stats_resp.status_code != 200:
        logger.warning("YouTube videos.details échoué (%s)", stats_resp.status_code)
        return []

    results = []
    for video in stats_resp.json().get("items", []):
        snippet = video.get("snippet", {})
        stats = video.get("statistics", {})
        duration = _parse_iso_duration(video.get("contentDetails", {}).get("duration", "PT0S"))
        views = int(stats.get("viewCount", 0))
        published_at = snippet.get("publishedAt")
        if duration < MIN_DURATION_SECONDS or duration > MAX_DURATION_SECONDS:
            continue
        if views < MIN_VIEWS:
            continue
        if published_at:
            published_date = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
            if (datetime.utcnow() - published_date).days > MAX_VIDEO_AGE_DAYS:
                continue
        results.append(
            {
                "concept": concept.get("name"),
                "video_id": video.get("id"),
                "title": snippet.get("title"),
                "url": f"https://www.youtube.com/watch?v={video.get('id')}",
                "thumbnail_url": snippet.get("thumbnails", {}).get("medium", {}).get("url"),
                "duration_seconds": duration,
                "views": views,
                "published_at": published_at,
            }
        )
    return results


def _download_audio(video_id: str, target_dir: str) -> Optional[str]:
    if yt_dlp is None:
        return None
    output_template = os.path.join(target_dir, "%(id)s.%(ext)s")
    options = {
        "format": "bestaudio/best",
        "outtmpl": output_template,
        "quiet": True,
        "noplaylist": True,
        "no_warnings": True,
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
    }
    with yt_dlp.YoutubeDL(options) as ydl:
        ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
    candidates = [os.path.join(target_dir, f) for f in os.listdir(target_dir) if f.startswith(video_id)]
    return next((path for path in candidates if path.endswith(".mp3") or path.endswith(".m4a")), None)


def _transcribe_with_whisper(audio_path: str) -> Optional[str]:
    if not getattr(settings, "GROQ_API_KEY", None):
        logger.warning("GROQ_API_KEY manquante pour le fallback Whisper Groq.")
        return None
    
    url = "https://api.groq.com/openai/v1/audio/transcriptions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}"
    }
    
    try:
        # L'API Groq (whisper-large-v3-turbo) est extrêmement rapide et peu coûteuse
        with open(audio_path, "rb") as audio_file:
            files = {
                "file": (os.path.basename(audio_path), audio_file, "audio/mpeg")
            }
            data = {
                "model": "whisper-large-v3-turbo",
            }
            response = requests.post(url, headers=headers, files=files, data=data, timeout=120)
            
        if response.status_code == 200:
            return response.json().get("text", "").strip()
        else:
            logger.warning("Erreur Groq Transcription (HTTP %s): %s", response.status_code, response.text[:200])
            return None
    except Exception as exc:
        logger.warning("Exception lors de la transcription Groq: %s", exc)
        return None


def _transcribe_video(video_id: str) -> Optional[str]:
    if YouTubeTranscriptApi is not None:
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=["fr", "en"])
            return " ".join([segment.get("text", "") for segment in transcript]).strip()
        except _TRANSCRIPT_EXCEPTIONS:
            logger.info("Pas de sous-titres trouvés pour %s, tentative de fallback via Groq Whisper.", video_id)
            pass

    # Fallback si pas de sous-titres : on DL l'audio et on l'envoie à l'IA vocale
    temp_dir = tempfile.mkdtemp(prefix="roadmap_")
    try:
        audio_path = _download_audio(video_id, temp_dir)
        if not audio_path:
            return None
        return _transcribe_with_whisper(audio_path)
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)


def _create_evaluation_payload(candidate: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "transcript": candidate.get("transcript"),
        "concept": candidate.get("concept"),
        "title": candidate.get("title"),
    }


def _evaluate_candidate(candidate: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    if not candidate.get("transcript"):
        return None
    messages = [
        {
            "role": "system",
            "content": "Vous êtes un évaluateur pédagogique. Répondez en JSON.",
        },
        {
            "role": "user",
            "content": (
                f"Évaluez la pertinence de la vidéo '{candidate.get('title')}', "
                f"concept '{candidate.get('concept')}'. Transcription : {candidate.get('transcript')[:2000]}"
            ),
        },
    ]
    try:
        response = _call_openrouter(messages, max_tokens=500)
        raw = _extract_message_text(response.get("choices", [])[0].get("message", {}).get("content", ""))
        parsed = _parse_openrouter_json(raw)
        if not parsed:
            logger.warning("Erreur de parsing JSON pour l'évaluation: %s", raw[:200])
            return None
        score = parsed.get("score")
        if isinstance(score, str):
            score = float(score.replace("%", ""))
        return {
            "score": int(score),
            "summary": parsed.get("summary"),
            "level": parsed.get("level"),
        }
    except Exception as exc:  # pragma: no cover
        logger.warning("Evaluation OpenRouter échouée : %s", exc)
        return {"score": 70, "summary": "Résumé automatisé", "level": "intermédiaire"}


def _build_sections_from_openrouter(analysis: Dict[str, Any], validated: List[Dict[str, Any]]) -> Dict[str, Any]:
    messages = [
        {
            "role": "system",
            "content": "Génère une roadmap structurée sous forme JSON.",
        },
        {
            "role": "user",
            "content": (
                "Crée une roadmap organisée par semaines/chapitres à partir des vidéos suivantes :\n"
                + "".join([f"- {video.get('title')} ({video.get('url')})\n" for video in validated])
            ),
        },
    ]
    try:
        response = _call_openrouter(messages, max_tokens=900)
        parsed = _parse_openrouter_sections(response)
        if parsed:
            return parsed
    except Exception as exc:  # pragma: no cover
        logger.warning("Construction roadmap OpenRouter échouée : %s", exc)
    return _build_default_sections(analysis, validated)


def _normalize_sections(
    sections_obj: Dict[str, Any],
    validated: List[Dict[str, Any]],
    analysis: Dict[str, Any],
) -> Dict[str, Any]:
    sections = sections_obj.get("sections", [])
    normalized_sections = []
    for section in sections:
        normalized_sections.append(
            {
                "title": section.get("title", "Section"),
                "description": section.get("description"),
                "position": section.get("position") or len(normalized_sections) + 1,
                "period_label": section.get("period_label"),
                "metadata": section.get("metadata", {}),
                "resources": [],
            }
        )
    if not normalized_sections:
        normalized_sections = _build_default_sections(analysis, validated)["sections"]

    has_resources = any(section.get("resources") for section in normalized_sections)
    if validated and not has_resources:
        for idx, resource in enumerate(validated):
            normalized_sections[min(idx, len(normalized_sections) - 1)]["resources"].append(_build_resource_payload(resource))

    return {
        "sections": normalized_sections,
        "summary": sections_obj.get("summary") or "Roadmap automatique",
        "meta": sections_obj.get("meta", {}),
    }


async def _run_pipeline(job_uuid: str, celery_id: str, attempt: int) -> None:
    job = await roadmap_service.fetch_job_status(job_uuid)
    if not job:
        raise ValueError(f"Job {job_uuid} introuvable")
    payload = job.get("payload") or {}
    roadmap_id = job.get("roadmap_id")
    if not roadmap_id:
        raise ValueError("La roadmap associée est manquante")

    await roadmap_service.update_job(
        job_uuid,
        status=RoadmapJobStatus.analyzing,
        current_step="analysis",
        progress={"stage": "analysis", "attempt": attempt + 1},
        celery_task_id=celery_id,
    )
    await roadmap_service.update_roadmap(roadmap_id, status=RoadmapJobStatus.analyzing)

    analysis = await asyncio.to_thread(_perform_analysis, payload)

    await roadmap_service.update_job(
        job_uuid,
        status=RoadmapJobStatus.scraping,
        current_step="scraping",
        progress={"stage": "scraping"},
    )
    await roadmap_service.update_roadmap(roadmap_id, status=RoadmapJobStatus.scraping)

    scrape_tasks = []
    for concept in analysis.get("concepts", []):
        scrape_tasks.append(asyncio.to_thread(_search_youtube_concept, concept))
    raw_candidates = await asyncio.gather(*scrape_tasks, return_exceptions=True)
    candidates = [item for sub in raw_candidates if isinstance(sub, list) for item in sub]

    await roadmap_service.update_job(
        job_uuid,
        status=RoadmapJobStatus.transcribing,
        current_step="transcribing",
        progress={"stage": "transcribing", "candidates": len(candidates)},
    )
    await roadmap_service.update_roadmap(roadmap_id, status=RoadmapJobStatus.transcribing)

    if not candidates:
        logger.warning("Aucun candidat vidéo trouvé sur YouTube. Vérifiez l'API Key ou les filtres.")
        
    async def process_transcript(candidate):
        try:
            transcript = await asyncio.to_thread(_transcribe_video, candidate.get("video_id"))
            if transcript:
                candidate["transcript"] = transcript
                return candidate
            else:
                logger.info("Vidéo %s ignorée (pas de sous-titres)", candidate.get("video_id"))
        except Exception as exc:
            logger.warning("Erreur transcription %s: %s", candidate.get("video_id"), exc)
        return None

    transcript_tasks = [process_transcript(cand) for cand in candidates]
    transcribed_results = await asyncio.gather(*transcript_tasks)
    transcribed = [c for c in transcribed_results if c is not None]

    if not transcribed:
        logger.warning("Aucune vidéo transcripte parmi les %d candidats.", len(candidates))

    async def process_evaluation(candidate):
        try:
            eval_result = await asyncio.to_thread(_evaluate_candidate, candidate)
            if eval_result and eval_result.get("score", 0) >= 60:
                candidate.update(eval_result)
                candidate["summary"] = candidate.get("summary") or eval_result.get("summary")
                return candidate
            else:
                score = eval_result.get("score") if eval_result else "None"
                logger.info("Vidéo %s éliminée (score %s insuffisant ou erreur JSON)", candidate.get("video_id"), score)
        except Exception as exc:
            logger.warning("Erreur évaluation %s: %s", candidate.get("title"), exc)
        return None

    evaluation_tasks = [process_evaluation(cand) for cand in transcribed]
    eval_results = await asyncio.gather(*evaluation_tasks)
    evaluations = [c for c in eval_results if c is not None]

    if not evaluations:
        raise ValueError("Aucun contenu vidéo validé pour la roadmap")

    await roadmap_service.update_job(
        job_uuid,
        status=RoadmapJobStatus.evaluating,
        current_step="evaluating",
        progress={"stage": "evaluating", "validated": len(evaluations)},
    )
    await roadmap_service.update_roadmap(roadmap_id, status=RoadmapJobStatus.evaluating)

    sections_payload = await asyncio.to_thread(_build_sections_from_openrouter, analysis, evaluations)
    sections_normalized = _normalize_sections(sections_payload, evaluations, analysis)

    await roadmap_service.update_job(
        job_uuid,
        status=RoadmapJobStatus.building,
        current_step="building",
        progress={"stage": "building", "sections": len(sections_normalized["sections"])},
    )
    await roadmap_service.update_roadmap(roadmap_id, status=RoadmapJobStatus.building)

    await roadmap_service.clear_roadmap_sections(roadmap_id)
    await roadmap_service.persist_sections(roadmap_id, sections_normalized["sections"])

    await roadmap_service.update_roadmap(
        roadmap_id,
        status=RoadmapJobStatus.done,
        summary=sections_normalized.get("summary"),
        meta=sections_normalized.get("meta") or analysis.get("meta"),
        finished_at=datetime.utcnow(),
    )
    await roadmap_service.update_job(
        job_uuid,
        status=RoadmapJobStatus.done,
        current_step="done",
        progress={"stage": "done"},
        finished_at=datetime.utcnow(),
    )


from app.api.dependencies import close_db_pool

@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def roadmap_pipeline_task(self, job_uuid: str) -> None:
    attempt = self.request.retries
    
    async def run_and_cleanup():
        try:
            await _run_pipeline(job_uuid, self.request.id, attempt)
        finally:
            await close_db_pool()
            
    try:
        asyncio.run(run_and_cleanup())
    except Exception as exc:  # pragma: no cover
        if attempt >= self.max_retries:
            async def fail_and_cleanup():
                try:
                    await roadmap_service.mark_job_failed(job_uuid, str(exc))
                finally:
                    await close_db_pool()
            asyncio.run(fail_and_cleanup())
            raise
        raise self.retry(exc=exc)
