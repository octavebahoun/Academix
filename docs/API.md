# 📡 Documentation API - AcademiX Platform

## Vue d'Ensemble

AcademiX expose **3 APIs principales** :

1. **Laravel REST API** - Backend core (Port 8000)
2. **Python FastAPI** - Service IA (Port 5000)
3. **Node.js WebSocket** - Temps réel (Port 3001)

---

# 🔷 1. Laravel REST API

**Base URL**: `http://localhost:8000/api/v1`  
**Auth**: Bearer Token (Laravel Sanctum)

## 🔐 Authentification

### POST `/auth/register`

Inscription d'un nouvel étudiant

**Request:**

```json
{
  "email": "etudiant@exemple.com",
  "password": "MotDePasse123!",
  "password_confirmation": "MotDePasse123!",
  "nom": "Dupont",
  "prenom": "Jean",
  "universite": "Université de Paris",
  "filiere": "Informatique",
  "niveau": "L3",
  "objectif_moyenne": 14.5
}
```

**Response (201):**

```json
{
  "user": {
    "id": 1,
    "email": "etudiant@exemple.com",
    "nom": "Dupont",
    "prenom": "Jean"
  },
  "token": "1|abcdef123456..."
}
```

---

### POST `/auth/login`

Connexion utilisateur

**Request:**

```json
{
  "email": "etudiant@exemple.com",
  "password": "MotDePasse123!"
}
```

**Response (200):**

```json
{
  "user": {
    "id": 1,
    "email": "etudiant@exemple.com",
    "nom": "Dupont",
    "prenom": "Jean"
  },
  "token": "2|xyz789..."
}
```

---

### GET `/auth/me`

Profil utilisateur connecté

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200):**

```json
{
  "id": 1,
  "email": "etudiant@exemple.com",
  "nom": "Dupont",
  "prenom": "Jean",
  "universite": "Université de Paris",
  "filiere": "Informatique",
  "niveau": "L3",
  "objectif_moyenne": 14.5,
  "xp_total": 250,
  "niveau_gamification": 3
}
```

---

### PUT `/auth/profile`

Mise à jour du profil

**Headers:**

```
Authorization: Bearer {token}
```

**Request:**

```json
{
  "objectif_moyenne": 15.0,
  "style_apprentissage": "visuel",
  "avatar_url": "https://exemple.com/avatar.jpg"
}
```

---

## 📚 Matières

### GET `/matieres`

Liste des matières de l'étudiant

**Response (200):**

```json
[
  {
    "id": 1,
    "nom": "Algorithmique",
    "coefficient": 3,
    "couleur": "#3B82F6",
    "user_id": 1
  },
  {
    "id": 2,
    "nom": "Base de Données",
    "coefficient": 2,
    "couleur": "#10B981"
  }
]
```

---

### POST `/matieres`

Ajouter une matière

**Request:**

```json
{
  "nom": "Intelligence Artificielle",
  "coefficient": 4,
  "couleur": "#8B5CF6"
}
```

**Response (201):**

```json
{
  "id": 3,
  "nom": "Intelligence Artificielle",
  "coefficient": 4,
  "couleur": "#8B5CF6",
  "user_id": 1
}
```

---

### PUT `/matieres/{id}`

Modifier une matière

**Request:**

```json
{
  "coefficient": 5,
  "couleur": "#EF4444"
}
```

---

### DELETE `/matieres/{id}`

Supprimer une matière

**Response (204):** No Content

---

## ✅ Tâches

### GET `/taches`

Liste des tâches

**Query Parameters:**

- `statut` (optionnel): `pending`, `completed`
- `priorite` (optionnel): `haute`, `moyenne`, `basse`
- `date_debut` (optionnel): Date ISO
- `date_fin` (optionnel): Date ISO

**Response (200):**

```json
[
  {
    "id": 1,
    "titre": "TD Algorithmique chapitre 3",
    "description": "Exercices sur les arbres binaires",
    "date_limite": "2026-02-20T23:59:59Z",
    "priorite": "haute",
    "statut": "pending",
    "matiere": {
      "id": 1,
      "nom": "Algorithmique"
    }
  }
]
```

---

### POST `/taches`

Créer une tâche

**Request:**

```json
{
  "titre": "Révision partiel",
  "description": "Chapitres 1 à 5",
  "date_limite": "2026-02-25T18:00:00Z",
  "priorite": "haute",
  "matiere_id": 1
}
```

---

### PATCH `/taches/{id}/complete`

Marquer une tâche comme terminée

**Response (200):**

```json
{
  "id": 1,
  "statut": "completed",
  "xp_gagne": 10
}
```

---

### POST `/taches/extract`

Extraction automatique de tâches depuis document

**Request (multipart/form-data):**

```
file: emploi_temps.pdf
```

**Response (200):**

```json
{
  "taches_extraites": [
    {
      "titre": "TP Réseaux",
      "date_limite": "2026-02-18T14:00:00Z",
      "matiere_detectee": "Réseaux"
    }
  ]
}
```

---

## 📊 Notes & Moyennes

### GET `/notes`

Liste des notes

**Query Parameters:**

- `matiere_id` (optionnel): Filtrer par matière

**Response (200):**

```json
[
  {
    "id": 1,
    "note_obtenue": 16.5,
    "note_max": 20,
    "coefficient": 1,
    "type_evaluation": "Partiel",
    "date_evaluation": "2026-02-10",
    "matiere": {
      "id": 1,
      "nom": "Algorithmique"
    }
  }
]
```

---

### POST `/notes`

Ajouter une note

**Request:**

```json
{
  "matiere_id": 1,
  "note_obtenue": 17.5,
  "note_max": 20,
  "coefficient": 2,
  "type_evaluation": "Examen final",
  "date_evaluation": "2026-02-15"
}
```

---

### POST `/notes/import-ocr`

Import de note via OCR (photo)

**Request (multipart/form-data):**

```
image: photo_note.jpg
```

**Response (200):**

```json
{
  "notes_detectees": [
    {
      "matiere": "Algorithmique",
      "note": 15.5,
      "coefficient": 1
    }
  ]
}
```

---

### GET `/moyennes`

Calcul des moyennes

**Response (200):**

```json
{
  "moyenne_generale": 14.75,
  "objectif_moyenne": 15.0,
  "ecart": -0.25,
  "matieres": [
    {
      "matiere_id": 1,
      "nom": "Algorithmique",
      "moyenne": 16.0,
      "coefficient": 3,
      "poids_moyenne_generale": 0.3
    },
    {
      "matiere_id": 2,
      "nom": "Base de Données",
      "moyenne": 13.5,
      "coefficient": 2,
      "poids_moyenne_generale": 0.2
    }
  ],
  "alerte_active": true,
  "message_alerte": "Moyenne inférieure à l'objectif"
}
```

---

## ⚠️ Alertes (Early Warning System)

### GET `/alertes`

Liste des alertes actives

**Response (200):**

```json
[
  {
    "id": 1,
    "type_alerte": "moyenne_faible",
    "niveau_severite": "moyen",
    "titre": "Moyenne en baisse",
    "message": "Ta moyenne en Base de Données est passée de 15 à 13.5",
    "actions_suggerees": [
      "Réviser les chapitres 3 et 4",
      "Rejoindre une session collaborative",
      "Demander de l'aide à un tuteur"
    ],
    "is_read": false,
    "created_at": "2026-02-16T10:30:00Z"
  }
]
```

---

## 👥 Sessions Collaboratives

### GET `/sessions`

Sessions disponibles

**Query Parameters:**

- `format` (optionnel): `visio`, `presentiel`, `chat`
- `matiere_id` (optionnel)

**Response (200):**

```json
[
  {
    "id": 1,
    "titre": "Révision Algorithmique - Arbres",
    "description": "Session de révision pour le partiel",
    "date_debut": "2026-02-18T14:00:00Z",
    "duree_minutes": 90,
    "format": "visio",
    "max_participants": 10,
    "participants_actuels": 4,
    "createur": {
      "id": 2,
      "nom": "Martin",
      "prenom": "Sophie"
    },
    "matiere": {
      "id": 1,
      "nom": "Algorithmique"
    }
  }
]
```

---

### POST `/sessions`

Créer une session

**Request:**

```json
{
  "titre": "Révision Base de Données",
  "description": "SQL et normalisation",
  "date_debut": "2026-02-20T16:00:00Z",
  "duree_minutes": 120,
  "format": "visio",
  "max_participants": 8,
  "matiere_id": 2
}
```

---

### POST `/sessions/{id}/join`

Rejoindre une session

**Response (200):**

```json
{
  "message": "Inscription confirmée",
  "room_url": "https://meet.academix.com/session-123",
  "participants_count": 5
}
```

---

### POST `/sessions/{id}/rate`

Noter une session

**Request:**

```json
{
  "note": 5,
  "commentaire": "Très utile, merci Sophie!"
}
```

---

## 🤖 Contenus IA

### GET `/contenus-ia`

Contenus générés par IA

**Query Parameters:**

- `type_contenu` (optionnel): `fiche`, `quiz`, `podcast`, `exercices`

**Response (200):**

```json
[
  {
    "id": 1,
    "type_contenu": "fiche",
    "titre": "Fiche de révision - Arbres binaires",
    "contenu_json": {
      "sections": [
        {
          "titre": "Définition",
          "contenu": "Un arbre binaire est..."
        }
      ]
    },
    "source_document": "cours_algo_chapitre3.pdf",
    "created_at": "2026-02-15T12:00:00Z"
  }
]
```

---

## 🧩 Quiz

### GET `/quiz-questions`

Questions de quiz

**Query Parameters:**

- `matiere_id` (optionnel)
- `difficulte` (optionnel): `facile`, `moyen`, `difficile`

**Response (200):**

```json
[
  {
    "id": 1,
    "question": "Quelle est la complexité d'une recherche dans un arbre binaire équilibré ?",
    "options": ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    "reponse_correcte_index": 1,
    "explication": "Dans un arbre équilibré, la hauteur est log(n)",
    "difficulte": "moyen",
    "matiere_id": 1
  }
]
```

---

## 🔔 Notifications

### GET `/notifications`

Liste des notifications

**Query Parameters:**

- `is_read` (optionnel): `true`, `false`

**Response (200):**

```json
[
  {
    "id": 1,
    "type": "new_note",
    "titre": "Nouvelle note ajoutée",
    "message": "Note de 16.5/20 en Algorithmique",
    "is_read": false,
    "created_at": "2026-02-16T09:00:00Z"
  }
]
```

---

### PATCH `/notifications/{id}/read`

Marquer comme lue

**Response (200):**

```json
{
  "id": 1,
  "is_read": true
}
```

---

# 🐍 2. Python FastAPI - Service IA

**Base URL**: `http://localhost:5000/api/v1`  
**Auth**: API Key (header `X-API-Key`)

## 📝 Génération de Contenus

### POST `/ai/generate-summary`

Générer une fiche de révision

**Headers:**

```
X-API-Key: your-api-key
```

**Request:**

```json
{
  "text": "Cours complet sur les arbres binaires...",
  "type": "fiche",
  "options": {
    "niveau": "L3",
    "format": "detaille"
  }
}
```

**Response (200):**

```json
{
  "titre": "Fiche de révision - Arbres binaires",
  "sections": [
    {
      "titre": "Définition",
      "contenu": "Un arbre binaire est une structure de données..."
    },
    {
      "titre": "Propriétés",
      "points_cles": [
        "Chaque noeud a au plus 2 fils",
        "Hauteur minimale: log(n)"
      ]
    }
  ],
  "mots_cles": ["arbre", "binaire", "noeud", "feuille"],
  "temps_generation_sec": 3.2
}
```

---

### POST `/ai/generate-quiz`

Générer un QCM

**Request:**

```json
{
  "text": "Cours sur les bases de données relationnelles...",
  "nb_questions": 10,
  "difficulte": "moyen",
  "matiere": "Base de Données"
}
```

**Response (200):**

```json
{
  "questions": [
    {
      "question": "Qu'est-ce qu'une clé primaire ?",
      "options": [
        "Un attribut unique",
        "Une clé étrangère",
        "Un index",
        "Une contrainte"
      ],
      "reponse_correcte_index": 0,
      "explication": "Une clé primaire identifie de manière unique chaque ligne"
    }
  ],
  "nb_questions": 10,
  "difficulte": "moyen"
}
```

---

### POST `/ai/generate-podcast`

Générer un podcast audio (TTS)

**Request:**

```json
{
  "text": "Résumé du chapitre sur les algorithmes de tri...",
  "voix": "fr-FR-Denise",
  "vitesse": 1.0
}
```

**Response (200):**

```json
{
  "audio_url": "http://localhost:5000/generated/podcast_abc123.mp3",
  "duree_secondes": 245,
  "taille_bytes": 3145728
}
```

---

### POST `/ai/generate-exercises`

Générer des exercices

**Request:**

```json
{
  "matiere": "Algorithmique",
  "chapitre": "Tri et recherche",
  "nb_exercices": 5,
  "difficulte": "progressif"
}
```

**Response (200):**

```json
{
  "exercices": [
    {
      "numero": 1,
      "enonce": "Écrire une fonction de tri par insertion",
      "difficulte": "facile",
      "indice": "Commencer par le 2ème élément",
      "correction": "def tri_insertion(arr): ..."
    }
  ]
}
```

---

## 📄 Extraction de Documents

### POST `/ai/extract-from-pdf`

Extraction depuis PDF

**Request (multipart/form-data):**

```
file: cours_algorithmique.pdf
options: {
  "extract_images": true,
  "ocr_images": true
}
```

**Response (200):**

```json
{
  "texte_extrait": "Chapitre 3: Les arbres binaires...",
  "nb_pages": 45,
  "images_extraites": 12,
  "structure": {
    "titre_principal": "Cours d'Algorithmique",
    "chapitres": [
      {
        "numero": 3,
        "titre": "Les arbres binaires",
        "pages": [10, 25]
      }
    ]
  },
  "metadata": {
    "auteur": "Prof. Dupont",
    "date_creation": "2025-09-01"
  }
}
```

---

### POST `/ai/extract-from-image`

OCR depuis image

**Request (multipart/form-data):**

```
image: notes_manuscrites.jpg
langue: "fra"
```

**Response (200):**

```json
{
  "texte_extrait": "Algorithmique\nTP n°3\nNotes: 16.5/20",
  "confiance_moyenne": 0.92,
  "donnees_structurees": {
    "matiere": "Algorithmique",
    "type": "TP",
    "numero": 3,
    "note": 16.5
  }
}
```

---

# ⚡ 3. Node.js WebSocket - Temps Réel

**URL**: `ws://localhost:3001`  
**Protocol**: Socket.io  
**Auth**: JWT Token lors de la connexion

## 🔌 Connexion

```javascript
import io from "socket.io-client";

const socket = io("http://localhost:3001", {
  auth: {
    token: "your-jwt-token",
  },
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});
```

---

## 🎮 Events Quiz

### Client → Server

#### `join-quiz`

Rejoindre un quiz

```javascript
socket.emit("join-quiz", {
  quizId: 123,
  userId: 1,
});
```

#### `answer-question`

Répondre à une question

```javascript
socket.emit("answer-question", {
  quizId: 123,
  questionId: 5,
  answer: 2, // Index de la réponse
  timeSeconds: 8.5,
});
```

#### `leave-quiz`

Quitter le quiz

```javascript
socket.emit("leave-quiz", {
  quizId: 123,
});
```

---

### Server → Client

#### `quiz-started`

Quiz démarré

```javascript
socket.on("quiz-started", (data) => {
  // data: { quizId, totalQuestions, participants }
});
```

#### `quiz-update`

Nouvelle question

```javascript
socket.on("quiz-update", (data) => {
  // data: {
  //   questionNumber: 3,
  //   question: "Qu'est-ce qu'un arbre binaire ?",
  //   options: ["...", "...", "..."],
  //   timeLimit: 30
  // }
});
```

#### `leaderboard-update`

Mise à jour du classement

```javascript
socket.on("leaderboard-update", (leaderboard) => {
  // leaderboard: [
  //   { userId: 1, nom: "Jean", score: 850, rank: 1 },
  //   { userId: 2, nom: "Sophie", score: 720, rank: 2 }
  // ]
});
```

#### `quiz-ended`

Quiz terminé

```javascript
socket.on("quiz-ended", (results) => {
  // results: {
  //   finalLeaderboard: [...],
  //   userScore: 850,
  //   userRank: 1,
  //   correctAnswers: 8,
  //   totalQuestions: 10
  // }
});
```

---

## 💬 Events Chat (Sessions)

### Client → Server

#### `join-session`

Rejoindre une session

```javascript
socket.emit("join-session", {
  sessionId: 456,
  userId: 1,
});
```

#### `send-message`

Envoyer un message

```javascript
socket.emit("send-message", {
  sessionId: 456,
  message: "Quelqu'un peut m'expliquer les arbres AVL ?",
});
```

#### `whiteboard-draw`

Dessiner sur le tableau blanc

```javascript
socket.emit("whiteboard-draw", {
  sessionId: 456,
  action: "draw",
  data: {
    x: 100,
    y: 150,
    color: "#000",
    size: 2,
  },
});
```

---

### Server → Client

#### `new-message`

Nouveau message

```javascript
socket.on("new-message", (message) => {
  // message: {
  //   userId: 2,
  //   nom: "Sophie",
  //   message: "Oui, je peux t'aider !",
  //   timestamp: "2026-02-16T14:30:00Z"
  // }
});
```

#### `whiteboard-update`

Mise à jour tableau blanc

```javascript
socket.on("whiteboard-update", (data) => {
  // data: { action: 'draw', x: 100, y: 150, ... }
});
```

#### `participant-update`

Participants changés

```javascript
socket.on("participant-update", (participants) => {
  // participants: [
  //   { userId: 1, nom: "Jean", online: true },
  //   { userId: 2, nom: "Sophie", online: true }
  // ]
});
```

---

## 🔔 Events Notifications

### Server → Client

#### `notification`

Notification temps réel

```javascript
socket.on("notification", (notif) => {
  // notif: {
  //   type: "new_note",
  //   titre: "Nouvelle note",
  //   message: "Note de 17/20 en Algorithmique",
  //   timestamp: "2026-02-16T15:00:00Z"
  // }
});
```

---

## 🔒 Codes d'Erreur HTTP

| Code | Signification                          |
| ---- | -------------------------------------- |
| 200  | OK                                     |
| 201  | Created                                |
| 204  | No Content                             |
| 400  | Bad Request                            |
| 401  | Unauthorized (token invalide/manquant) |
| 403  | Forbidden (pas les permissions)        |
| 404  | Not Found                              |
| 422  | Validation Error                       |
| 500  | Internal Server Error                  |

---

## 📚 Exemples Complets

### Exemple: Créer un quiz et le lancer

```javascript
// 1. Créer des questions (Laravel API)
const response = await axios.post(
  "http://localhost:8000/api/v1/quiz-questions",
  {
    matiere_id: 1,
    questions: [
      /* ... */
    ],
  },
  {
    headers: { Authorization: `Bearer ${token}` },
  },
);

const quizId = response.data.quiz_id;

// 2. Connexion WebSocket
const socket = io("http://localhost:3001", {
  auth: { token },
});

// 3. Rejoindre le quiz
socket.emit("join-quiz", { quizId, userId: 1 });

// 4. Écouter les événements
socket.on("quiz-update", (question) => {
  console.log("Nouvelle question:", question);
});

socket.on("leaderboard-update", (leaderboard) => {
  console.log("Classement:", leaderboard);
});

// 5. Répondre
socket.emit("answer-question", {
  quizId,
  questionId: question.id,
  answer: 1,
  timeSeconds: 12.5,
});
```

---

**Dernière mise à jour**: 16 février 2026  
**Version**: 1.0.0
