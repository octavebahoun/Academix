"""
Routes pour la génération d'images via OpenRouter + Gemini 2.5 Flash
"""
import os
import base64
import uuid
import requests
from fastapi import APIRouter, Query
from fastapi.responses import FileResponse
from app.core.config import settings

router = APIRouter()

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "generated", "images")
os.makedirs(OUTPUT_DIR, exist_ok=True)


@router.post("/generate")
async def generate_image(
    prompt: str = Query(..., description="Description de l'image à générer"),
):
    """Génère une image via OpenRouter + Gemini 2.5 Flash Image Preview."""
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        return {"error": "OPENROUTER_API_KEY non définie dans .env"}

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": "google/gemini-2.5-flash-image",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": f"Generate an image: {prompt}"}
                    ],
                }
            ],
        },
    )

    if response.status_code != 200:
        return {"error": f"Erreur OpenRouter ({response.status_code})", "detail": response.text}

    data = response.json()

    choices = data.get("choices", [])
    if not choices:
        return {"error": "Pas de réponse du modèle", "raw": data}

    message = choices[0].get("message", {})
    content = message.get("content", [])

    if isinstance(content, str):
        return {"message": "Réponse texte uniquement", "text": content, "raw": data}

    image_id = str(uuid.uuid4())
    text_parts = []

    for part in content:
        if isinstance(part, dict):
            if part.get("type") == "image_url":
                image_data = part.get("image_url", {}).get("url", "")
                if image_data.startswith("data:"):
                    header, b64 = image_data.split(",", 1)
                    ext = "png" if "png" in header else "jpeg"
                    img_bytes = base64.b64decode(b64)
                    file_path = os.path.join(OUTPUT_DIR, f"{image_id}.{ext}")
                    with open(file_path, "wb") as f:
                        f.write(img_bytes)
                    return {
                        "image_id": image_id,
                        "prompt": prompt,
                        "image_url": f"/api/v1/image/download/{image_id}.{ext}",
                        "size_bytes": len(img_bytes),
                        "format": ext,
                        "text": "\n".join(text_parts) if text_parts else None,
                    }
            elif part.get("type") == "text":
                text_parts.append(part.get("text", ""))

    return {
        "message": "Pas d'image trouvée dans la réponse",
        "text": "\n".join(text_parts) if text_parts else None,
        "raw": data,
    }


@router.get("/download/{filename}")
async def download_image(filename: str):
    """Télécharge une image générée."""
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        return {"error": "Image introuvable"}
    return FileResponse(file_path, media_type="image/png")
