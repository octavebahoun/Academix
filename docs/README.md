# 📚 Documentation AcademiX Platform

> Plateforme académique intelligente avec IA générative pour étudiants

## 🎯 Vision

Une plateforme tout-en-un qui accompagne l'étudiant sur **3 axes interconnectés** :

### 📅 Organisation

- Calendrier unifié
- Gestion des tâches et devoirs
- Rappels intelligents
- Anticipation des échéances

### 🧠 Apprentissage

- Génération IA (fiches, quiz, podcasts, exercices)
- Extraction automatique depuis documents PDF
- Modes d'étude personnalisés
- Suivi de performance

### 👥 Collaboration

- Sessions de révision collaboratives
- Quiz multi-joueurs en temps réel
- Partage de ressources
- Système de réputation et gamification

---

## 📖 Table des Matières

### Guides de Démarrage

- **[Installation](./INSTALLATION.md)** - Setup complet pour développement local
- **[Démarrage Rapide](./QUICKSTART.md)** - Lancer tous les services rapidement
- **[Configuration](./CONFIGURATION.md)** - Variables d'environnement et paramétrage

### Architecture Technique

- **[Architecture](./ARCHITECTURE.md)** - Vue d'ensemble microservices
- **[Stack Technique](./STACK.md)** - Technologies utilisées par service
- **[Base de Données](./DATABASE.md)** - Schéma et relations

### API & Intégration

- **[API Laravel](./API_LARAVEL.md)** - Backend core REST API
- **[API Python FastAPI](./API_PYTHON.md)** - Service IA
- **[WebSocket Node.js](./API_WEBSOCKET.md)** - Service temps réel
- **[Authentification](./AUTHENTICATION.md)** - Laravel Sanctum & JWT

### Fonctionnalités

- **[MVP Essentiel](./FEATURES_MVP.md)** - Fonctionnalités prioritaires
- **[Différenciateurs](./FEATURES_ADVANCED.md)** - Fonctionnalités avancées
- **[Modules](./MODULES.md)** - Description détaillée des 6 modules

### Guides Utilisateur

- **[Parcours Utilisateur](./USER_JOURNEY.md)** - Flow complet étudiant
- **[Cas d'Usage](./USE_CASES.md)** - Scénarios concrets

### Déploiement & Production

- **[Déploiement](./DEPLOYMENT.md)** - Guide production
- **[CI/CD](./CICD.md)** - Pipeline d'intégration continue
- **[Monitoring](./MONITORING.md)** - Logs et surveillance

---

## 🚀 Démarrage Ultra-Rapide

### 1. Installation automatique

```bash
cd /home/octave/Bureau/hackaton
./setup_all.sh
```

### 2. Démarrage de tous les services

```bash
./start-all.sh
```

### 3. Accéder à la plateforme

- **Frontend**: http://localhost:5173
- **API Laravel**: http://localhost:8000
- **API Python IA**: http://localhost:5000
- **WebSocket Node**: http://localhost:3001

---

## 🏗️ Architecture en Bref

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│              http://localhost:5173                          │
└────────────┬────────────────────────┬───────────────────────┘
             │                        │
             ▼                        ▼
    ┌────────────────┐      ┌─────────────────────┐
    │  Laravel API   │      │  Node.js WebSocket  │
    │  Port: 8000    │      │  Port: 3001         │
    │  REST API      │      │  Socket.io          │
    │  Auth, CRUD    │      │  Quiz, Chat, Live   │
    └────────┬───────┘      └──────────────────────┘
             │
             ▼
    ┌─────────────────┐
    │  Python FastAPI │
    │  Port: 5000     │
    │  IA Services    │
    │  OpenAI, Claude │
    └─────────────────┘
             │
             ▼
    ┌─────────────────┐
    │  MySQL 8.0      │
    │  Database       │
    │  academix       │
    └─────────────────┘
```

---

## 📦 Services & Technologies

| Service             | Technologie             | Port | Rôle                           |
| ------------------- | ----------------------- | ---- | ------------------------------ |
| **Frontend**        | React + Vite + Tailwind | 5173 | Interface utilisateur          |
| **API Core**        | Laravel 11 + Sanctum    | 8000 | Backend principal, Auth, CRUD  |
| **Service IA**      | Python + FastAPI        | 5000 | Génération contenus IA         |
| **Temps Réel**      | Node.js + Socket.io     | 3001 | Quiz live, Chat, Notifications |
| **Base de Données** | MySQL 8.0               | 3306 | Stockage données               |

---

## 🎯 MVP Essentiel (2 semaines)

### ✅ Priorité Absolue

- [x] Authentification & Profil étudiant
- [x] Calendrier unifié
- [x] Gestion des tâches
- [x] Notes & calcul moyennes
- [x] Early Warning System
- [x] Génération IA (fiches + quiz)
- [x] Sessions collaboratives
- [x] Notifications temps réel

### ⭐ Différenciateurs Clés

- Matching intelligent (tuteurs/étudiants)
- Planning adaptatif basé IA
- Quiz temps réel type Kahoot
- Bibliothèque collaborative
- Podcast IA (Text-to-Speech)

---

## 👥 Équipe & Responsabilités

| Membre               | Rôle          | Services                      |
| -------------------- | ------------- | ----------------------------- |
| **Hanna BIAOU**      | Frontend Lead | React, Vite, Tailwind, Redux  |
| **Mourchid FOLARIN** | Backend Lead  | Laravel, MySQL, API REST      |
| **Octave BAHOUN**    | Full-Stack    | Node.js, Python IA, WebSocket |

---

## 📞 Support & Contribution

### Signaler un bug

Créer une issue sur le repository GitHub

### Contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Projet Hackathon - IFRI 2026 - Team D'Excellence

---

**Dernière mise à jour**: 16 février 2026  
**Version**: 1.0.0 (MVP)
