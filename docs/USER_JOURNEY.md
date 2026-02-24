# 👤 Parcours Utilisateur - AcademiX Platform

## Vue d'Ensemble

Ce document décrit le **parcours complet d'un étudiant** utilisant AcademiX, de l'inscription à l'utilisation quotidienne de la plateforme.

**Persona**: Sophie, étudiante en L3 Informatique

---

## 🚀 Phase 1: Découverte & Inscription (Jour 1)

### Étape 1.1: Arrivée sur la plateforme

**Contexte:**

> Sophie a entendu parler d'AcademiX par un ami. Elle cherche une solution pour mieux organiser ses études.

**Actions:**

1. Visite `https://academix.com`
2. Découvre la landing page avec les 3 piliers :
   - 📅 Organisation
   - 🧠 Apprentissage IA
   - 👥 Collaboration
3. Clique sur "S'inscrire gratuitement"

**Écran**: Landing Page → Call-to-Action

---

### Étape 1.2: Inscription

**Actions:**

1. Remplit le formulaire d'inscription
   - Email: sophie.martin@universite.fr
   - Mot de passe sécurisé
   - Confirmation mot de passe
2. Clique sur "Créer mon compte"
3. Reçoit email de vérification
4. Clique sur le lien de confirmation

**Endpoint**: `POST /auth/register`

**Temps estimé**: 1 minute

---

### Étape 1.3: Onboarding - Profil

**Actions:**

1. Redirigée vers page de création de profil
2. Remplit ses informations :
   - Nom: Martin
   - Prénom: Sophie
   - Université: Université de Paris
   - Filière: Informatique
   - Niveau: L3
   - Objectif de moyenne: 14.5
   - Style d'apprentissage: Visuel
3. Upload photo de profil (optionnel)
4. Clique sur "Continuer"

**Endpoint**: `PUT /auth/profile`

**Temps estimé**: 2 minutes

---

### Étape 1.4: Onboarding - Matières

**Actions:**

1. Page "Ajoutez vos matières"
2. Ajoute ses matières du semestre :
   - Algorithmique (coefficient 3, couleur bleue)
   - Base de Données (coefficient 2, couleur verte)
   - Réseaux (coefficient 2, couleur orange)
   - Anglais (coefficient 1, couleur rose)
3. Clique sur "Continuer"

**Endpoint**: `POST /matieres` (x4)

**Temps estimé**: 2 minutes

---

### Étape 1.5: Onboarding - Emploi du temps

**Actions:**

1. Option 1: Upload PDF emploi du temps
   - Upload `emploi_temps_S6.pdf`
   - Système extrait automatiquement les cours
   - Sophie valide et corrige si besoin
2. OU Option 2: Saisie manuelle
   - Ajoute cours par cours
   - Lundi 8h-10h: Algorithmique (CM)
   - Lundi 10h-12h: Base de Données (TD)
   - etc.
3. Clique sur "Terminer"

**Endpoints**:

- `POST /taches/extract` (si upload PDF)
- `POST /emploi_temps` (x plusieurs)

**Temps estimé**: 3 minutes

---

### ✅ Résultat Phase 1

Sophie a maintenant :

- ✅ Un compte créé et vérifié
- ✅ Un profil complet
- ✅ 4 matières configurées
- ✅ Son emploi du temps importé

**Temps total onboarding**: ~8 minutes

---

## 📅 Phase 2: Utilisation Quotidienne (Semaine 1)

### Jour 2 - Lundi Matin

#### 8h00 - Connexion & Dashboard

**Actions:**

1. Sophie se connecte sur `https://academix.com`
2. Arrive sur son **Dashboard**
3. Voit :
   - Widget "Aujourd'hui" avec ses cours du jour
   - Widget "Tâches à faire" (3 devoirs cette semaine)
   - Widget "Moyenne actuelle" (13.2 / Objectif: 14.5)
   - Notification: "Tu as 2 devoirs à rendre cette semaine"

**Endpoint**: `GET /auth/me`

---

#### 10h30 - Ajout d'une Tâche

**Contexte:**

> Le prof d'Algorithmique vient de donner un TD à rendre pour jeudi.

**Actions:**

1. Sophie clique sur "+" dans le widget Tâches
2. Remplit le formulaire rapide :
   - Titre: "TD Arbres Binaires"
   - Matière: Algorithmique
   - Date limite: Jeudi 20/02 à 23h59
   - Priorité: Haute
3. Clique sur "Ajouter"
4. Reçoit notification de confirmation

**Endpoint**: `POST /taches`

---

### Jour 3 - Mardi Après-midi

#### 14h00 - Ajout de Notes

**Contexte:**

> Sophie a récupéré sa note du partiel de Base de Données.

**Actions:**

1. Va dans "Mes Notes"
2. Clique sur "Ajouter une note"
3. Remplit :
   - Matière: Base de Données
   - Note: 12.5 / 20
   - Type: Partiel
   - Coefficient: 2
   - Date: 15/02/2026
4. Clique sur "Enregistrer"
5. Voit automatiquement :
   - Nouvelle moyenne BDD: 13.0
   - Moyenne générale mise à jour: 13.0
   - ⚠️ **Alerte**: "Ta moyenne est en dessous de ton objectif"

**Endpoints**:

- `POST /notes`
- `GET /moyennes` (auto-refresh)

---

#### 14h15 - Réaction à l'Alerte

**Actions:**

1. Sophie clique sur l'alerte
2. Voit le détail :
   - "Ta moyenne (13.0) est inférieure à ton objectif (14.5)"
   - Suggestions :
     - ✅ Réviser les chapitres récents de BDD
     - ✅ Rejoindre une session collaborative
     - ✅ Générer une fiche de révision IA
3. Clique sur "Générer une fiche IA"

**Endpoint**: `GET /alertes`

---

### Jour 4 - Mercredi Matin

#### 9h00 - Génération de Fiche IA

**Contexte:**

> Sophie veut réviser le cours de BDD sur la normalisation.

**Actions:**

1. Va dans "IA - Génération de Contenus"
2. Clique sur "Nouvelle Fiche"
3. Upload `cours_normalisation.pdf` (15 pages)
4. Sélectionne :
   - Type: Fiche de révision
   - Niveau détail: Moyen
   - Format: Structuré avec points clés
5. Clique sur "Générer"
6. **Attente**: 4 secondes ⏳
7. Reçoit la fiche générée :
   - Titre: "Normalisation des Bases de Données"
   - 5 sections structurées
   - Points clés surlignés
   - Exemples concrets
8. Options :
   - 💾 Télécharger PDF
   - 📖 Mode étude
   - 🎧 Générer podcast audio
9. Clique sur "Générer podcast"
10. **Attente**: 6 secondes ⏳
11. Télécharge `normalisation.mp3` (8 minutes)

**Endpoints**:

- `POST /ai/extract-from-pdf`
- `POST /ai/generate-summary`
- `POST /ai/generate-podcast`

**Temps total**: ~12 minutes

---

#### 10h00 - Génération de Quiz

**Actions:**

1. Clique sur "Générer Quiz" depuis la fiche
2. Paramètres :
   - Nombre de questions: 10
   - Difficulté: Moyen
3. **Attente**: 3 secondes ⏳
4. Reçoit le quiz avec 10 QCM
5. Démarre le quiz en mode solo
6. Répond aux 10 questions
7. Score final: 8/10 (80%)
8. Voit la correction détaillée avec explications
9. Section "Notions à revoir" :
   - "3ème forme normale"
   - "Dépendances fonctionnelles"

**Endpoints**:

- `POST /ai/generate-quiz`
- `POST /quiz-resultats`

**Temps total**: ~15 minutes

---

### Jour 5 - Jeudi Soir

#### 19h00 - Session Collaborative

**Contexte:**

> Sophie veut réviser l'Algorithmique avec d'autres étudiants avant le partiel de demain.

**Actions:**

1. Va dans "Sessions Collaboratives"
2. Filtre :
   - Matière: Algorithmique
   - Date: Aujourd'hui
3. Voit 2 sessions disponibles :
   - "Révision Arbres" (3/8 participants)
   - "Last minute Algo" (5/10 participants)
4. Clique sur "Révision Arbres"
5. Voit les détails :
   - Créateur: Jean Dupont (L3 Info)
   - Heure: 19h30-21h00
   - Format: Visio
   - Description: "Focus arbres binaires et AVL"
6. Clique sur "Rejoindre"
7. Confirmation: "Tu es inscrit !"

**Endpoint**: `POST /sessions/{id}/join`

---

#### 19h30 - Dans la Session

**Actions:**

1. Reçoit notification: "Ta session commence dans 5 min"
2. Clique sur le lien de la session
3. Entre dans la room WebSocket
4. Voit 4 autres participants en ligne
5. **Chat en temps réel** :
   - Jean: "Salut tout le monde !"
   - Sophie: "Salut ! On commence par quoi ?"
   - Marie: "Les arbres AVL svp, je galère"
6. Jean partage son écran
7. Discussions et échanges pendant 1h30
8. À la fin, Sophie note la session 5⭐
9. Laisse commentaire: "Super utile, merci Jean !"

**WebSocket Events**:

- `join-session`
- `send-message`
- `new-message`

**Endpoint final**: `POST /sessions/{id}/rate`

---

## 🎮 Phase 3: Features Avancées (Semaine 2)

### Jour 8 - Quiz Temps Réel (Type Kahoot)

#### 18h00 - Quiz Compétitif

**Contexte:**

> Un étudiant a créé un quiz live sur le chapitre de Réseaux.

**Actions:**

1. Sophie reçoit notification: "Quiz live sur Réseaux dans 5 min !"
2. Clique sur le lien
3. Entre le code de la room: `#RESEAUX123`
4. Rejoint avec 8 autres étudiants
5. **Le quiz démarre** :
   - Question 1 apparaît avec timer (30s)
   - Sophie répond rapidement (12s)
   - Points calculés: Justesse (100) + Rapidité (60) = 160 pts
6. **Leaderboard mis à jour en temps réel** :
   - 1. Thomas - 850 pts
   - 2. Sophie - 720 pts
   - 3. Marie - 680 pts
7. 10 questions au total
8. **Résultat final** :
   - Sophie: 2ème place / 9 joueurs
   - Score: 1420 points
   - 8/10 réponses correctes
   - Badge débloqué: "Top 3 🥈"
   - +50 XP gagnés

**WebSocket Events**:

- `join-quiz`
- `answer-question`
- `quiz-update`
- `leaderboard-update`
- `quiz-ended`

**Temps total**: ~10 minutes  
**Engagement**: 🔥🔥🔥 Très élevé

---

### Jour 10 - Matching Intelligent

#### 14h00 - Recherche de Tuteur

**Contexte:**

> Sophie a besoin d'aide en Réseaux (moyenne: 11.5).

**Actions:**

1. Va dans "Trouver un Tuteur"
2. Sélectionne matière: Réseaux
3. **IA analyse et propose 3 tuteurs compatibles** :
   - Thomas (moyenne 17.2, style: visuel ✅)
   - Pierre (moyenne 16.8, style: auditif)
   - Laura (moyenne 18.0, style: visuel ✅, disponible ce soir)
4. Sophie choisit Laura (matching 92%)
5. Envoie demande: "Salut Laura, aurais-tu du temps ce soir pour m'aider sur les protocoles TCP/IP ?"
6. Laura accepte
7. RDV fixé pour 20h en visio

**Endpoint**: `GET /matching/tuteurs?matiere_id=3`

---

### Jour 12 - Planning Adaptatif IA

#### 10h00 - Suggestions de Révision

**Contexte:**

> Sophie a 3 partiels dans 2 semaines.

**Actions:**

1. Va dans "Mon Planning"
2. **IA génère suggestions de créneaux** :
   - Lundi 14h-16h: Révision Algorithmique (priorité haute)
   - Mardi 18h-20h: Quiz BDD (notion faible: normalisation)
   - Mercredi 10h-12h: Session collaborative Réseaux
   - Jeudi 16h-18h: Révision Anglais
3. Sophie accepte 3 suggestions sur 4
4. Planning automatiquement mis à jour
5. Rappels configurés

**Endpoint**: `POST /planning/suggestions`

---

### Jour 14 - Bibliothèque Collaborative

#### 16h00 - Partage de Ressource

**Contexte:**

> Sophie a trouvé un super cours PDF sur les arbres AVL.

**Actions:**

1. Va dans "Bibliothèque"
2. Clique sur "Partager une Ressource"
3. Upload `cours_arbres_avl.pdf`
4. Remplit :
   - Titre: "Cours complet Arbres AVL + Exemples"
   - Matière: Algorithmique
   - Tags: arbres, AVL, rotation, équilibrage
   - Description: "Cours très clair avec exemples détaillés"
5. Clique sur "Publier"
6. Ressource visible par toute la communauté
7. Reçoit +10 XP pour contribution

**Endpoint**: `POST /ressources-partagees`

---

#### 16h15 - Recherche de Ressources

**Actions:**

1. Recherche: "Base de données normalisation"
2. Filtre: ⭐⭐⭐⭐⭐ (5 étoiles uniquement)
3. Voit 5 ressources top-notées :
   - "Fiche complète Normalisation" (4.9⭐, 127 vues)
   - "Vidéo explicative 3FN" (4.8⭐, 89 vues)
   - "Exercices corrigés" (4.7⭐, 156 vues)
4. Télécharge les 3 premières
5. Note la fiche 5⭐ après utilisation

**Endpoint**: `GET /ressources-partagees?search=normalisation&note_min=4.5`

---

## 📊 Bilan Semaine 2 (Dashboard)

### Statistiques de Sophie

**Académique:**

- Moyenne générale: **14.2** (↗️ +1.2 depuis le début)
- Objectif: 14.5 (écart: -0.3, en bonne voie ✅)
- Notes ajoutées: 8
- Tâches complétées: 12/15 (80%)

**Apprentissage IA:**

- Fiches générées: 5
- Quiz générés: 8
- Quiz complétés: 12
- Score moyen: 78%
- Podcasts écoutés: 3

**Collaboration:**

- Sessions rejointes: 4
- Sessions créées: 1
- Messages envoyés: 47
- Ressources téléchargées: 8
- Ressources partagées: 2

**Gamification:**

- XP total: 450
- Niveau: 4
- Badges débloqués: 6
  - 🏆 "Première note"
  - 📚 "5 fiches générées"
  - 🎮 "Top 3 quiz"
  - 👥 "5 sessions collaboratives"
  - 📖 "10 ressources téléchargées"
  - ⭐ "Contributeur actif"

---

## 💡 Points Clés du Parcours

### Ce que Sophie apprécie le plus :

1. **⏱️ Gain de temps**

   > "En 5 secondes, j'ai une fiche complète de révision"

2. **🎯 Organisation**

   > "Je vois tout d'un coup d'œil, plus de stress"

3. **🤝 Collaboration**

   > "J'ai trouvé des camarades pour réviser facilement"

4. **🎮 Gamification**

   > "Les quiz live sont addictifs, je révise sans m'en rendre compte"

5. **⚠️ Alertes intelligentes**
   > "Je suis prévenue avant que ce soit trop tard"

---

## 🎯 Objectifs Atteints

Après 2 semaines d'utilisation :

- ✅ Moyenne passée de 13.0 à 14.2
- ✅ 100% des devoirs rendus à temps
- ✅ 4 sessions collaboratives (nouvelles connaissances)
- ✅ Révisions optimisées grâce à l'IA
- ✅ Stress réduit grâce à l'organisation

---

**Dernière mise à jour**: 24 février 2026  
**Version**: 1.0.0
