# 🎯 Fonctionnalités MVP - AcademiX Platform

## Vue d'Ensemble

Le MVP (Minimum Viable Product) d'AcademiX se concentre sur **3 piliers fondamentaux** :

1. **Organisation Intelligente**
2. **Apprentissage Assisté par IA**
3. **Collaboration & Social Learning**

**Durée de développement**: 2 semaines  
**Focus**: Livrer une expérience utilisateur complète sur les fonctionnalités essentielles

---

## ✅ Fonctionnalités Essentielles (MVP Core)

### 🔐 1. Authentification & Profil

**Statut**: ✅ Priorité Absolue

**Features:**

- ✅ Inscription avec email/mot de passe
- ✅ Connexion sécurisée (Laravel Sanctum)
- ✅ Profil étudiant complet
  - Informations personnelles
  - Université, filière, niveau
  - Objectif de moyenne
  - Style d'apprentissage (visuel/auditif/kinesthésique)
  - Avatar personnalisable
- ✅ Modification du profil
- ✅ Déconnexion

**Endpoints Laravel:**

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PUT /auth/profile`
- `POST /auth/logout`

**Impact Utilisateur:**

> "Je peux créer mon compte et personnaliser mon profil en 2 minutes"

---

### 📅 2. Calendrier Unifié

**Statut**: ✅ Priorité Absolue

**Features:**

- ✅ Vue semaine/mois du calendrier
- ✅ Affichage de l'emploi du temps
  - Cours planifiés (CM/TD/TP)
  - Code couleur par matière
  - Salle et horaires
- ✅ Synchronisation tâches/devoirs
- ✅ Événements personnels
- ✅ Navigation simple entre les dates

**Composants React:**

- `CalendarWeekView`
- `CalendarMonthView`
- `EventCard`

**Impact Utilisateur:**

> "Je visualise toute ma semaine en un coup d'œil"

---

### ✅ 3. Gestion des Tâches

**Statut**: ✅ Priorité Absolue

**Features:**

- ✅ Créer une tâche/devoir
  - Titre, description
  - Matière associée
  - Date limite
  - Priorité (haute/moyenne/basse)
- ✅ Marquer comme terminée
- ✅ Filtres (statut, priorité, date)
- ✅ Notifications de rappel
- ✅ **Extraction automatique basique** depuis PDF
  - Parser emploi du temps PDF
  - Extraire dates et devoirs

**Endpoints Laravel:**

- `GET /taches` (avec filtres)
- `POST /taches`
- `PATCH /taches/{id}/complete`
- `DELETE /taches/{id}`
- `POST /taches/extract` (upload PDF)

**Impact Utilisateur:**

> "Je ne rate plus jamais un devoir, tout est centralisé"

---

### 📊 4. Notes & Calcul de Moyennes

**Statut**: ✅ Priorité Absolue

**Features:**

- ✅ Ajouter une note
  - Note obtenue / Note max
  - Matière
  - Type d'évaluation (Partiel, TP, etc.)
  - Coefficient
  - Date
- ✅ Afficher toutes les notes (par matière)
- ✅ **Calcul automatique des moyennes**
  - Moyenne par matière
  - Moyenne générale pondérée par coefficients
  - Progression dans le temps
- ✅ Visualisations (graphiques)
  - Évolution notes par matière
  - Comparaison objectif vs réalité

**Endpoints Laravel:**

- `POST /notes`
- `GET /notes` (filtres par matière)
- `GET /moyennes` (calculs automatiques)

**Impact Utilisateur:**

> "Je connais ma moyenne en temps réel et vois ma progression"

---

### ⚠️ 5. Early Warning System

**Statut**: ✅ Priorité Absolue

**Features:**

- ✅ **Alertes automatiques**
  - Moyenne en baisse
  - Deadline proche (48h)
  - Note inférieure à l'objectif
- ✅ Niveaux de sévérité (faible/moyen/élevé)
- ✅ Actions suggérées
  - "Réviser le chapitre X"
  - "Rejoindre une session collaborative"
  - "Demander de l'aide"
- ✅ Notifications push (WebSocket)
- ✅ Historique des alertes

**Logique Backend:**

```php
// MoyenneService.php
if ($moyenne_actuelle < $objectif - 1.0) {
    Alerte::create([
        'type_alerte' => 'moyenne_faible',
        'niveau_severite' => 'moyen',
        'actions_suggerees' => [
            'Réviser les chapitres récents',
            'Rejoindre une session collaborative'
        ]
    ]);
}
```

**Impact Utilisateur:**

> "Je suis prévenu avant qu'il ne soit trop tard pour rattraper mon retard"

---

### 🤖 6. Génération IA Basique

**Statut**: ✅ Priorité Absolue

**Features:**

- ✅ **Fiches de révision**
  - Upload PDF ou copier-coller texte
  - Génération via GPT-4/Claude
  - Format structuré (sections, points clés)
  - Export PDF/Markdown
- ✅ **Quiz (QCM)**
  - 5-10 questions générées
  - 4 options par question
  - Correction automatique
  - Explications détaillées
- ✅ Interface simple
  - Upload de document
  - Choix du type (fiche/quiz)
  - Prévisualisation
  - Téléchargement

**Endpoints Python FastAPI:**

- `POST /ai/generate-summary`
- `POST /ai/generate-quiz`
- `POST /ai/extract-from-pdf`

**Models IA utilisés:**

- OpenAI GPT-4
- Anthropic Claude 3

**Impact Utilisateur:**

> "Je transforme mes cours en fiches et quiz en quelques secondes"

---

### 👥 7. Sessions Collaboratives

**Statut**: ✅ Priorité Absolue

**Features:**

- ✅ Créer une session de révision
  - Titre, description
  - Matière associée
  - Date/heure
  - Format (visio/présentiel/chat)
  - Nombre max de participants
- ✅ Rejoindre une session existante
- ✅ Liste des sessions disponibles (filtres)
- ✅ Chat en temps réel (WebSocket)
- ✅ Système de notation post-session
- ✅ Historique des sessions

**Endpoints Laravel:**

- `GET /sessions` (liste + filtres)
- `POST /sessions` (créer)
- `POST /sessions/{id}/join`
- `POST /sessions/{id}/rate`

**WebSocket Events:**

- `join-session`
- `send-message`
- `new-message`

**Impact Utilisateur:**

> "Je trouve facilement des camarades pour réviser ensemble"

---

### 🔔 8. Notifications Basiques

**Statut**: ✅ Priorité Absolue

**Features:**

- ✅ Notifications temps réel (WebSocket)
  - Nouvelle note ajoutée
  - Deadline proche (24h)
  - Alerte moyenne
  - Message session collaborative
- ✅ Badge nombre de notifications non lues
- ✅ Marquer comme lu
- ✅ Centre de notifications dans le header

**WebSocket Event:**

```javascript
socket.on("notification", (notif) => {
  // Afficher toast notification
  toast.info(notif.message);
});
```

**Impact Utilisateur:**

> "Je suis informé instantanément de tout ce qui est important"

---

## ⭐ Fonctionnalités Différenciatrices

### 🎯 1. Matching Intelligent (Tuteurs/Étudiants)

**Statut**: ⭐ Différenciateur Clé

**Features:**

- Algorithme de matching basé sur:
  - Matières en difficulté
  - Style d'apprentissage compatible
  - Disponibilités communes
  - Notes (tuteur performant)
- Suggestions automatiques
- Demande de tutorat
- Messagerie privée

**Valeur ajoutée:**

> "Trouver le bon tuteur automatiquement, sans chercher"

---

### 📅 2. Planning Adaptatif (IA)

**Statut**: ⭐ Différenciateur Clé

**Features:**

- IA suggère des créneaux de révision
- Priorise selon:
  - Deadlines proches
  - Matières faibles
  - Charge de travail
- S'adapte au style d'apprentissage
- Optimise le temps de révision

**Valeur ajoutée:**

> "L'IA organise ma semaine pour maximiser mes chances de réussite"

---

### 🎮 3. Quiz Temps Réel (Type Kahoot)

**Statut**: ⭐ Différenciateur Clé

**Features:**

- Quiz multi-joueurs synchronisés
- Timer par question
- Classement en direct (leaderboard)
- Points basés sur rapidité + justesse
- Animations & effets visuels
- Système de rooms (codes d'accès)

**WebSocket Events:**

- `join-quiz`
- `answer-question`
- `leaderboard-update`
- `quiz-ended`

**Valeur ajoutée:**

> "Réviser devient un jeu compétitif et motivant"

---

### 📚 4. Bibliothèque Collaborative

**Statut**: ⭐ Différenciateur Clé

**Features:**

- Partage de ressources (PDF, liens, vidéos)
- Tags & recherche avancée
- Système de notation (⭐ /5)
- Top ressources par matière
- Filtres (type, matière, note)
- Upload direct

**Valeur ajoutée:**

> "Accès à toutes les meilleures ressources de ma promo"

---

### 🎧 5. Podcast IA (Text-to-Speech)

**Statut**: ⭐ Différenciateur Clé

**Features:**

- Conversion texte → audio
- Voix naturelles (gTTS, ElevenLabs)
- Réglage vitesse lecture
- Téléchargement MP3
- Mode "révision en déplacement"

**Endpoint Python:**

- `POST /ai/generate-podcast`

**Valeur ajoutée:**

> "J'écoute mes fiches dans le bus ou en faisant du sport"

---

## 📊 Priorisation pour le Hackathon

### Semaine 1 (Jours 1-7)

**Jours 1-2: Setup & Architecture**

- [x] Configuration environnements
- [x] Base de données & migrations
- [x] Authentication Laravel

**Jours 3-4: Core Features**

- [x] CRUD Matières, Tâches, Notes
- [x] Calcul moyennes
- [x] Frontend Dashboard basique

**Jours 5-7: IA & Collaboration**

- [x] Intégration OpenAI (fiches + quiz)
- [x] Sessions collaboratives
- [x] WebSocket notifications

### Semaine 2 (Jours 8-14)

**Jours 8-10: Features Avancées**

- [x] Quiz temps réel (WebSocket)
- [x] Early Warning System
- [x] Extraction PDF tâches

**Jours 11-13: Différenciateurs**

- [x] Matching intelligent
- [x] Planning adaptatif
- [x] Bibliothèque collaborative

**Jour 14: Polish & Démo**

- [x] Corrections bugs
- [x] UI/UX finitions
- [x] Préparation présentation

---

## 🎯 Critères de Succès MVP

### Fonctionnel

- ✅ Un étudiant peut s'inscrire et créer son profil
- ✅ Il peut ajouter ses matières et son emploi du temps
- ✅ Il peut créer et gérer ses tâches
- ✅ Il peut enregistrer ses notes et voir sa moyenne
- ✅ Il reçoit des alertes si sa moyenne baisse
- ✅ Il peut générer une fiche ou un quiz depuis un cours
- ✅ Il peut rejoindre une session collaborative et chatter
- ✅ Il reçoit des notifications en temps réel

### Technique

- ✅ Toutes les APIs fonctionnent (Laravel, Python, Node)
- ✅ Frontend responsive (mobile-friendly)
- ✅ WebSocket stable (quiz + chat)
- ✅ Génération IA < 5 secondes
- ✅ Temps de réponse API < 500ms

### Expérience

- ✅ Interface claire et intuitive
- ✅ Onboarding fluide (< 3 min)
- ✅ Feedback visuel sur actions
- ✅ Pas de bugs bloquants

---

## 📈 Métriques de Succès

| Métrique                | Objectif MVP            |
| ----------------------- | ----------------------- |
| Temps inscription       | < 2 minutes             |
| Génération fiche IA     | < 5 secondes            |
| Temps réponse API       | < 500ms                 |
| Participants quiz live  | 2-10 joueurs simultanés |
| Taux complétion profil  | > 80%                   |
| Sessions créées/semaine | > 5                     |

---

## 🚫 Hors Scope MVP

Ces fonctionnalités sont **reportées après le MVP** :

- ❌ Application mobile native
- ❌ Intégration calendrier externe (Google Calendar, etc.)
- ❌ Reconnaissance vocale
- ❌ OCR manuscrit avancé
- ❌ Tableaux blancs collaboratifs complexes
- ❌ Système de paiement (tuteurs premium)
- ❌ Analytics avancés (ML prédictions)
- ❌ Gamification complète (achievements, leaderboards globaux)
- ❌ Intégration LMS (Moodle, Canvas)

---

## 💡 Évolutions Post-MVP

### Version 1.1 (1 mois après)

- Tableau blanc collaboratif
- OCR notes manuscrites
- Gamification complète
- Intégration calendrier externe

### Version 2.0 (3 mois après)

- Application mobile (React Native)
- Système de recommandation ML
- Marketplace tuteurs
- Intégration universités

---

**Dernière mise à jour**: 24 février 2026  
**Version**: 1.0.0 MVP
