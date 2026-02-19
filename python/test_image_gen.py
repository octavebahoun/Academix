"""
Test rapide : Génération d'images via OpenRouter + google/gemini-2.5-flash-image-preview
"""
import os
import base64
import requests
import uuid
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Test Image Generation", version="0.1")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OUTPUT_DIR = "./generated/images"
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.post("/api/v1/image/generate")
async def generate_image(
    prompt: str = Query(..., description="Description de l'image à générer"),
):
    """
    Génère une image via OpenRouter + Gemini 2.5 Flash Image Preview.
    Envoie un prompt texte, reçoit une image en retour.
    """
    if not OPENROUTER_API_KEY:
        return {"error": "OPENROUTER_API_KEY non définie dans .env"}

    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": "google/gemini-2.5-flash-preview-image-generation",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Generate an image: {prompt}"
                        }
                    ]
                }
            ],
        },
    )

    if response.status_code != 200:
        return {
            "error": f"Erreur OpenRouter ({response.status_code})",
            "detail": response.text
        }

    data = response.json()

    # Chercher l'image dans la réponse
    choices = data.get("choices", [])
    if not choices:
        return {"error": "Pas de réponse du modèle", "raw": data}

    message = choices[0].get("message", {})
    content = message.get("content", [])

    # Le contenu peut être une string ou une liste
    if isinstance(content, str):
        return {
            "message": "Le modèle a répondu en texte uniquement",
            "text": content,
            "raw": data
        }

    # Parcourir les parties pour trouver l'image
    image_id = str(uuid.uuid4())
    text_parts = []

    for part in content:
        if isinstance(part, dict):
            # Image inline en base64
            if part.get("type") == "image_url":
                image_data = part.get("image_url", {}).get("url", "")
                if image_data.startswith("data:"):
                    # Extraire le base64
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
                        "text": "\n".join(text_parts) if text_parts else None
                    }

            elif part.get("type") == "text":
                text_parts.append(part.get("text", ""))

    # Si pas d'image trouvée, retourner la réponse brute
    return {
        "message": "Pas d'image trouvée dans la réponse",
        "text": "\n".join(text_parts) if text_parts else None,
        "raw": data
    }


@app.get("/api/v1/image/download/{filename}")
async def download_image(filename: str):
    """Télécharge une image générée."""
    file_path = os.path.join(OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        return {"error": "Image introuvable"}
    return FileResponse(file_path, media_type="image/png")


@app.get("/")
def root():
    return {"status": "online", "service": "Image Generation Test"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("test_image_gen:app", host="0.0.0.0", port=8002, reload=True)
