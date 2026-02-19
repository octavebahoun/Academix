# 💬 Système de Chat Temps Réel - AcademiX

## 📋 Vue d'ensemble

Implémentation complète d'un système de **chat privé en temps réel** avec :

- ✅ **Persistance MongoDB** - Sauvegarde de tous les messages
- ✅ **Temps réel Socket.io** - Messages instantanés (< 100ms)
- ✅ **API REST** - Historique et gestion des conversations
- ✅ **Interface magnifique** - Tailwind CSS + Framer Motion
- ✅ **Indicateurs de frappe** - "en train d'écrire..."
- ✅ **Statut en ligne** - Présence temps réel
- ✅ **Messages non lus** - Compteurs et badges

---

## 🏗️ Architecture

### Backend (Node.js + MongoDB + Socket.io)

```
backend/node/src/
├── models/
│   └── PrivateMessage.js          # Modèle MongoDB pour les messages
├── controllers/
│   └── privateMessageController.js # Contrôleur REST API
├── routes/
│   └── privateMessages.js         # Routes Express
├── services/
│   └── privateMessageSocket.js    # Logique Socket.io temps réel
└── server.js                      # Point d'entrée avec MongoDB
```

### Frontend (React + Tailwind + Framer Motion)

```
frontend/src/
├── api/
│   ├── client.js                  # Client Axios configuré
│   └── messages.js                # API Messages
├── services/
│   └── socket.js                  # Service Socket.io client
└── pages/
    └── ChatPage.jsx               # Interface de chat complète
```

---

## 🔄 Flux de Données

### 1. Envoi d'un message

```
┌─────────────┐     Socket.io      ┌──────────────┐     MongoDB      ┌──────────┐
│   React     │ ═══════════════>   │   Node.js    │ ═══════════════> │ MongoDB  │
│  Frontend   │  send_private_msg  │   Backend    │   save()         │          │
└─────────────┘                    └──────────────┘                  └──────────┘
       ↓                                   ↓
   Confirmation                      Diffusion
   message_sent                   new_message (Socket.io)
                                         ↓
                            ┌─────────────────────────┐
                            │  Destinataire connecté  │
                            │  (temps réel < 100ms)   │
                            └─────────────────────────┘
```

### 2. Chargement de l'historique

```
┌─────────────┐      REST API      ┌──────────────┐     MongoDB      ┌──────────┐
│   React     │ ──────────────────> │   Node.js    │ ──────────────> │ MongoDB  │
│  Frontend   │  GET /messages/:id  │   Backend    │  find()         │          │
└─────────────┘ <────────────────── └──────────────┘ <────────────── └──────────┘
                   JSON Response
```

---

## 🚀 Installation et Démarrage

### Prérequis

- Node.js >= 20.x
- MongoDB Atlas (ou local)
- npm ou yarn

### 1️⃣ Backend

```bash
cd backend/node

# Installer les dépendances (déjà fait)
npm install

# Configurer les variables d'environnement
# Le fichier .env contient déjà MONGO_URI configuré

# Démarrer le serveur
npm run dev
```

Le serveur démarre sur **http://localhost:3001**

### 2️⃣ Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend démarre sur **http://localhost:5173**

---

## 📡 API REST Endpoints

### Messages Privés

| Méthode | Endpoint                        | Description                                     |
| ------- | ------------------------------- | ----------------------------------------------- |
| `GET`   | `/api/messages/conversations`   | Liste des conversations avec le dernier message |
| `GET`   | `/api/messages/unread-count`    | Nombre total de messages non lus                |
| `GET`   | `/api/messages/:userId`         | Historique de conversation avec un utilisateur  |
| `POST`  | `/api/messages`                 | Envoyer un message (sauvegarde uniquement)      |
| `PATCH` | `/api/messages/:messageId/read` | Marquer un message comme lu                     |

### Exemple de requête

```javascript
// Récupérer les messages avec l'utilisateur ID 2
const response = await fetch("http://localhost:3001/api/messages/2", {
  headers: {
    Authorization: "Bearer YOUR_TOKEN",
  },
});

const data = await response.json();
console.log(data.messages);
```

---

## 🔌 Événements Socket.io

### Namespace : `/private-messages`

#### Client → Serveur

| Événement              | Données                                  | Description                            |
| ---------------------- | ---------------------------------------- | -------------------------------------- |
| `user_online`          | `userId`                                 | Notifie que l'utilisateur est en ligne |
| `send_private_message` | `{ senderId, receiverId, content, ... }` | Envoie un message                      |
| `mark_as_read`         | `{ senderId, receiverId }`               | Marque les messages comme lus          |
| `typing_start`         | `{ senderId, receiverId }`               | L'utilisateur commence à taper         |
| `typing_stop`          | `{ senderId, receiverId }`               | L'utilisateur arrête de taper          |

#### Serveur → Client

| Événement             | Données                                   | Description                           |
| --------------------- | ----------------------------------------- | ------------------------------------- |
| `new_message`         | `{ _id, sender, receiver, content, ... }` | Nouveau message reçu                  |
| `message_sent`        | `{ success, message }`                    | Confirmation d'envoi                  |
| `message_error`       | `{ error }`                               | Erreur lors de l'envoi                |
| `messages_read`       | `{ readBy, timestamp }`                   | Messages marqués comme lus            |
| `user_typing`         | `{ userId, isTyping }`                    | Indicateur de frappe                  |
| `user_status_changed` | `{ userId, status }`                      | Changement de statut (online/offline) |

### Exemple de connexion Socket.io

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3001/private-messages", {
  auth: { token: "YOUR_JWT_TOKEN" },
});

// Notifier que l'utilisateur est en ligne
socket.emit("user_online", 1);

// Écouter les nouveaux messages
socket.on("new_message", (message) => {
  console.log("Nouveau message:", message);
  // Ajouter à l'interface
});

// Envoyer un message
socket.emit("send_private_message", {
  senderId: 1,
  receiverId: 2,
  content: "Salut !",
  sender_info: { nom: "Dupont", prenom: "Jean" },
});
```

---

## 🎨 Interface Utilisateur

### Fonctionnalités visuelles

- **Animations d'entrée** : Les conversations et messages apparaissent avec des animations fluides
- **Gradient dynamique** : Fond dégradé purple/pink pour une ambiance moderne
- **Avatars personnalisés** : Utilisation de DiceBear pour des avatars uniques
- **Indicateur de frappe** : Animation de 3 points qui sautent
- **Badge de messages non lus** : Compteur animé qui pulse
- **Statut en ligne** : Point vert qui pulse pour les utilisateurs connectés
- **Hover effects** : Effets de survol sur tous les éléments interactifs
- **Auto-scroll** : Scroll automatique vers le bas lors de nouveaux messages

### Personnalisation

Le design utilise **Tailwind CSS 4** avec des classes utilitaires et des gradients personnalisés :

```jsx
// Exemple de message envoyé
<div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl px-4 py-3">
  {message.content}
</div>

// Exemple de message reçu
<div className="bg-white/10 backdrop-blur-xl text-white rounded-2xl px-4 py-3">
  {message.content}
</div>
```

---

## 📊 Modèle de Données MongoDB

### Collection `private_messages`

```javascript
{
  _id: ObjectId,
  sender: Number,              // ID utilisateur MySQL
  receiver: Number,            // ID utilisateur MySQL
  content: String,             // Contenu du message
  type: String,                // 'text', 'image', 'file'
  file_url: String,            // URL du fichier (si applicable)
  read: Boolean,               // Message lu ?
  read_at: Date,               // Date de lecture
  sender_info: {               // Dénormalisation pour performance
    nom: String,
    prenom: String,
    avatar_url: String
  },
  receiver_info: {
    nom: String,
    prenom: String,
    avatar_url: String
  },
  is_deleted: Boolean,         // Soft delete
  createdAt: Date,             // Timestamp auto
  updatedAt: Date              // Timestamp auto
}
```

### Index

```javascript
// Performance optimisée
{ sender: 1, receiver: 1, createdAt: -1 }  // Récupération conversations
{ receiver: 1, read: 1 }                    // Compteur messages non lus
```

---

## 🔐 Sécurité

### Authentification

L'implémentation actuelle utilise un **middleware d'authentification** `auth.js` qui doit :

1. Vérifier le token JWT dans les headers
2. Extraire l'ID utilisateur
3. Attacher `req.user` à la requête

```javascript
// Exemple de middleware auth
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      nom: decoded.nom,
      prenom: decoded.prenom,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide" });
  }
};
```

### Validation des données

- ✅ Validation côté serveur des champs obligatoires
- ✅ Sanitization du contenu des messages
- ✅ Vérification des permissions (un utilisateur ne peut lire que ses propres messages)

---

## 🚦 Tests

### Test du backend

```bash
# Tester la connexion MongoDB
curl http://localhost:3001/health

# Tester l'API REST (nécessite un token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3001/api/messages/conversations
```

### Test Socket.io

Utilisez un outil comme **Socket.io Client Tool** ou **Postman** :

1. Connecter à `ws://localhost:3001/private-messages`
2. Emit `user_online` avec votre userId
3. Emit `send_private_message` avec les données du message
4. Observer les événements `new_message`

---

## 📈 Performance

### Optimisations implémentées

- **Index MongoDB** : Requêtes optimisées pour les conversations
- **Dénormalisation** : Infos utilisateur dans chaque message (évite les joins)
- **Pagination** : Limite par défaut de 50 messages
- **Lazy Loading** : Chargement à la demande de l'historique
- **Optimistic UI** : Affichage immédiat avant confirmation serveur

### Scalabilité

Pour scaler en production :

- **Redis Adapter** : Pour Socket.io sur plusieurs instances
- **CDN** : Pour les assets statiques
- **Load Balancer** : Nginx pour distribuer la charge
- **MongoDB Sharding** : Pour des millions de messages

---

## 🐛 Debugging

### Logs côté serveur

Le serveur utilise **Winston** pour les logs :

```javascript
logger.info("Message saved");
logger.error("Error sending message:", error);
```

Les logs sont affichés dans la console et peuvent être configurés pour écrire dans des fichiers.

### Logs côté client

Dans la console du navigateur :

```javascript
console.log("📨 Nouveau message reçu:", message);
console.log("✅ Connected to private messages socket");
```

---

## 🎯 Prochaines améliorations

- [ ] Upload de fichiers/images
- [ ] Recherche dans les messages
- [ ] Suppression de messages
- [ ] Édition de messages
- [ ] Réactions (emoji)
- [ ] Messages vocaux
- [ ] Appels vidéo (WebRTC)
- [ ] Encryption end-to-end

---

## 📚 Ressources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Documentation](https://react.dev/)

---

## 👥 Auteur

**Octave BAHOUN-HOUTOUKPE**  
Backend (Node.js + Python IA)  
AcademiX Platform - Hackathon 2026

---

**Version**: 2.0.0  
**Dernière mise à jour**: 18 février 2026
