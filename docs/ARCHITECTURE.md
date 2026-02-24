# 🏗️ Architecture AcademiX Platform

## Vue d'Ensemble

AcademiX utilise une **architecture microservices hybride** optimisée pour :

- Scalabilité horizontale
- Séparation des responsabilités
- Maintenabilité
- Performance temps réel

---

## 📊 Diagramme d'Architecture Globale

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │          React Frontend (Vite + Tailwind)                  │  │
│  │  - State Management: Redux/Zustand                         │  │
│  │  - Real-time: Socket.io-client                             │  │
│  │  - HTTP Client: Axios                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────┬─────────────────────┬─────────────────────────┘
                   │                     │
                   │                     │
        ┌──────────▼──────────┐   ┌─────▼──────────────┐
        │   API GATEWAY        │   │  WebSocket Gateway │
        │   (Optional Nginx)   │   │   (Socket.io)      │
        └──────────┬──────────┘   └─────┬──────────────┘
                   │                     │
    ┌──────────────┴─────────────────────┴──────────────┐
    │                   SERVICE LAYER                     │
    │                                                     │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │
    │  │   Laravel    │  │   Node.js    │  │  Python  │ │
    │  │   Backend    │  │   WebSocket  │  │ FastAPI  │ │
    │  │              │  │              │  │          │ │
    │  │  Port: 8000  │  │  Port: 3001  │  │ Port:5000│ │
    │  │              │  │              │  │          │ │
    │  │  - REST API  │  │  - Socket.io │  │ - IA Gen │ │
    │  │  - Sanctum   │  │  - Redis Pub │  │ - OpenAI │ │
    │  │  - CRUD      │  │  - Quiz Live │  │ - Claude │ │
    │  │  - Auth      │  │  - Chat      │  │ - TTS    │ │
    │  └──────┬───────┘  └──────────────┘  └────┬─────┘ │
    │         │                                  │       │
    └─────────┼──────────────────────────────────┼───────┘
              │                                  │
              │         ┌────────────────┐       │
              └────────►│     MySQL      │◄──────┘
                        │   Database     │
                        │  Port: 3306    │
                        └────────────────┘
                                │
                        ┌───────┴────────┐
                        │  Redis Cache   │
                        │  (Optional)    │
                        └────────────────┘
```

---

## 🎯 Services Détaillés

### 1. Frontend - React + Vite

**Responsabilités:**

- Interface utilisateur responsive
- Gestion d'état global
- Communication REST & WebSocket
- Optimisation des performances

**Technologies:**

```yaml
Framework: React 18
Build Tool: Vite 5
Styling: Tailwind CSS 3
State: Redux Toolkit / Zustand
HTTP: Axios
WebSocket: Socket.io-client
Routing: React Router v6
Forms: React Hook Form + Zod
Icons: Material Icons / Heroicons
```

**Structure:**

```
frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   ├── pages/           # Pages principales
│   ├── layouts/         # Layouts (Dashboard, Auth)
│   ├── features/        # Features par module
│   ├── services/        # API clients
│   ├── store/           # Redux store
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilitaires
│   └── assets/          # Images, fonts, icons
```

---

### 2. Backend Core - Laravel 11

**Responsabilités:**

- Authentification & autorisation
- CRUD pour toutes les entités
- Logique métier principale
- Gestion des fichiers
- Calculs (moyennes, alertes)

**Technologies:**

```yaml
Framework: Laravel 12
Auth: Laravel Sanctum
Database: Eloquent ORM
Validation: Form Requests
Jobs: Queue (Redis/Database)
Cache: Redis / File
Storage: Local / S3
```

**Architecture Laravel:**

```
backend/laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   ├── Api/
│   │   │   └── ...
│   │   ├── Middleware/
│   │   ├── Requests/        # Form Requests
│   │   └── Resources/       # API Resources
│   ├── Models/              # Eloquent Models
│   ├── Services/            # Business Logic
│   │   ├── MoyenneService.php
│   │   ├── AlerteService.php
│   │   └── TacheService.php
│   ├── Repositories/        # Data Access Layer
│   └── Observers/           # Model Events
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── routes/
│   ├── api.php              # API routes
│   └── web.php
└── config/
```

**Endpoints Principaux:**

- `/api/auth/*` - Authentification
- `/api/matieres/*` - Matières
- `/api/taches/*` - Tâches
- `/api/notes/*` - Notes
- `/api/sessions/*` - Sessions collaboratives
- `/api/contenus-ia/*` - Contenus générés

---

### 3. Service IA - Python FastAPI

**Responsabilités:**

- Génération de contenus IA
- Extraction de documents (PDF, images)
- Text-to-Speech (podcasts)
- OCR (notes manuscrites)

**Technologies:**

```yaml
Framework: FastAPI
IA: OpenAI GPT-4, Anthropic Claude
PDF: PyPDF2, pdfplumber
OCR: pytesseract, EasyOCR
TTS: gTTS, pyttsx3
NLP: spaCy, NLTK
Async: asyncio, httpx
```

**Structure:**

```
python/
├── app/
│   ├── api/
│   │   ├── routes.py          # API routes
│   │   └── dependencies.py    # DI
│   ├── services/
│   │   ├── openai_service.py
│   │   ├── claude_service.py
│   │   ├── pdf_extractor.py
│   │   ├── quiz_generator.py
│   │   └── text_summarizer.py
│   ├── models/
│   │   ├── schemas.py         # Pydantic models
│   │   └── responses.py
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   └── utils/
│       ├── file_handler.py
│       └── validators.py
├── uploads/                   # Fichiers temporaires
├── generated/                 # Contenus générés
└── main.py
```

**Endpoints Principaux:**

- `/ai/generate-summary` - Fiches de révision
- `/ai/generate-quiz` - QCM
- `/ai/generate-podcast` - Audio TTS
- `/ai/extract-from-pdf` - Extraction PDF
- `/ai/extract-from-image` - OCR

---

### 4. Service Temps Réel - Node.js + Socket.io

**Responsabilités:**

- Quiz collaboratifs en temps réel
- Chat des sessions
- Tableau blanc collaboratif
- Notifications push
- Présence en ligne

**Technologies:**

```yaml
Runtime: Node.js 20
Framework: Express.js
WebSocket: Socket.io
Auth: JWT
Cache: Redis (rooms, pub/sub)
```

**Structure:**

```
backend/node/
├── src/
│   ├── server.js              # Point d'entrée
│   ├── config/
│   │   ├── socket.js
│   │   └── redis.js
│   ├── controllers/
│   │   ├── chatController.js
│   │   └── notificationController.js
│   ├── services/
│   │   └── socketService.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── chat.js
│   │   └── notifications.js
│   └── utils/
│       ├── jwt.js
│       └── logger.js
```

**Events WebSocket:**

```javascript
// Client → Server
socket.emit("join-quiz", { quizId, userId });
socket.emit("answer-question", { questionId, answer });
socket.emit("send-message", { sessionId, message });

// Server → Client
socket.on("quiz-update", (data) => {});
socket.on("leaderboard-update", (leaderboard) => {});
socket.on("new-message", (message) => {});
socket.on("notification", (notification) => {});
```

---

## 🔄 Flux de Données

### Flux 1: Authentification

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│  React   │─────►│ Laravel  │─────►│  MySQL   │
│ Frontend │ POST │   API    │ Query│ Database │
└──────────┘ /auth└──────────┘      └──────────┘
     │         /register              │
     │                                │
     │◄───────────────────────────────┘
     │      JWT Token (Sanctum)
     │
     │ Store in localStorage
     │ + Set Authorization header
```

### Flux 2: Génération IA

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│  React   │─────►│ Laravel  │─────►│  Python  │─────►│ OpenAI   │
│          │ POST │   API    │ HTTP │ FastAPI  │ API  │   GPT    │
└──────────┘ /ai  └──────────┘ POST └──────────┘      └──────────┘
     │         /generate           /ai/           │
     │                            generate         │
     │                                            │
     │◄───────────────────────────────────────────┘
     │           Generated Content
     │           (Fiche, Quiz, Podcast)
```

### Flux 3: Quiz Temps Réel

```
┌──────────┐      ┌──────────┐      ┌──────────┐
│ React 1  │──────┤          │      │          │
│ Student  │ WS   │ Node.js  │◄─────┤  Redis   │
└──────────┘      │ Socket.io│ Pub  │  Pub/Sub │
                  │          │ Sub  │          │
┌──────────┐      │          │      └──────────┘
│ React 2  │──────┤          │
│ Student  │ WS   │          │
└──────────┘      └──────────┘
     │                  │
     │  join-quiz       │ Broadcast
     │  answer-question │ leaderboard-update
     │◄─────────────────┘ quiz-update
```

---

## 🔐 Sécurité & Authentification

### Laravel Sanctum (Backend)

```php
// Headers requis
Authorization: Bearer {token}

// Middleware
Route::middleware('auth:sanctum')->group(function () {
    // Routes protégées
});
```

### JWT pour WebSocket (Node.js)

```javascript
// Connexion Socket.io
socket.on("authenticate", (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.userId = decoded.id;
});
```

### API Key pour Python

```python
# Header requis
X-API-Key: {api_key}

# Validation
async def verify_api_key(api_key: str = Header(...)):
    if api_key != settings.API_KEY:
        raise HTTPException(status_code=403)
```

---

## 📡 Communication Inter-Services

### Laravel → Python (HTTP)

```php
$response = Http::withHeaders([
    'X-API-Key' => env('PYTHON_API_KEY')
])->post(env('PYTHON_AI_SERVICE_URL') . '/ai/generate-summary', [
    'text' => $course_content,
    'type' => 'fiche'
]);
```

### Laravel → Node.js (HTTP pour trigger)

```php
Http::post(env('NODE_SOCKET_SERVICE_URL') . '/api/notify', [
    'userId' => $user->id,
    'type' => 'new_note',
    'message' => 'Nouvelle note ajoutée'
]);
```

### React → WebSocket (Socket.io)

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  auth: { token: localStorage.getItem("token") },
});

socket.emit("join-quiz", { quizId: 123 });
socket.on("quiz-update", (data) => {
  console.log("Quiz mis à jour", data);
});
```

---

## 🚀 Scalabilité

### Scaling Horizontal

**Frontend:**

- CDN (Cloudflare, AWS CloudFront)
- Multiple instances derrière load balancer

**Laravel:**

- Load balancer (Nginx, HAProxy)
- Redis pour sessions partagées
- Queue workers distribués

**Node.js:**

- Redis adapter pour Socket.io
- Sticky sessions (load balancer)

**Python:**

- Multiple workers (Gunicorn, Uvicorn)
- Task queue (Celery + Redis)

### Optimisations

**Cache Strategy:**

```
Redis Cache:
├── Users sessions
├── API responses (10-60s)
├── Moyennes calculées (5min)
└── Socket.io rooms
```

**Database:**

- Indexes sur colonnes fréquemment requêtées
- Eager loading (Laravel N+1 problem)
- Query optimization

---

## 📦 Déploiement

### Docker Compose (Recommandé)

```yaml
version: "3.8"
services:
  frontend:
    build: ./frontend
    ports: ["5173:5173"]

  laravel:
    build: ./backend/laravel
    ports: ["8000:8000"]
    depends_on: [mysql, redis]

  python:
    build: ./python
    ports: ["5000:5000"]

  node:
    build: ./backend/node
    ports: ["3001:3001"]
    depends_on: [redis]

  mysql:
    image: mysql:8.0
    ports: ["3306:3306"]

  redis:
    image: redis:alpine
    ports: ["6379:6379"]
```

---

## 🎯 Recommandations Architecture

### ✅ Bonnes Pratiques

- ✓ Séparation claire des responsabilités
- ✓ Utiliser Redis pour scaling
- ✓ API versioning (`/api/v1/`)
- ✓ Centraliser les logs
- ✓ Health checks sur tous les services
- ✓ Monitoring (Prometheus, Grafana)

### ❌ À Éviter

- ✗ Appels synchrones bloquants
- ✗ Logique métier dans les contrôleurs
- ✗ Queries N+1
- ✗ Secrets en dur dans le code
- ✗ Pas de validation des entrées

---

**Dernière mise à jour**: 24 février 2026  
**Version**: 1.0.0
