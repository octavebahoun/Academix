
https://github.com/user-attachments/assets/5d52b0b9-f747-48f3-8241-776be3f248c5
<div align="center">
  <h1>🚀 AcademiX Platform</h1>
  <p><em>L'assistant académique indispensable propulsé par l'IA</em></p>
</div>

AcademiX est une plateforme académique tout-en-un qui combine organisation intelligente, intelligence artificielle générative et collaboration sociale pour maximiser les chances de réussite académique des étudiants avec une faible ingérence administrative.

## 🎯 Le Problème & Notre Solution

**Le constat :** Les étudiants sont souvent submergés par leurs cours, manquent d'accompagnement personnalisé et les outils de révision sont dispersés.

**Notre solution AcademiX :** Devenir l'assistant académique indispensable de chaque étudiant en combinant les forces de l'IA générative, de l'analyse prédictive et de la collaboration sociale.


##Présentation de notre Solution
**Video de présentation de la solution**:

https://github.com/user-attachments/assets/605575f4-60c2-4e1d-841c-1c5e182d0db6
- **Lien de la video** : https://drive.google.com/file/d/1v_0wWAZrGHXexBTI-7_gWSbs9kTB-yby/view?usp=sharing




## 🌟 Démonstration en Ligne (Déploiement)

Vous pouvez tester l'application directement en ligne. Nous avons mis en place **trois parcours (flux)** accessibles via le lien de connexion principal :

### 1️⃣ Flux Administrateur Principal

- **Lien de connexion** : [https://team-d-excellence-hackbyifri-2026.vercel.app/login](https://team-d-excellence-hackbyifri-2026.vercel.app/login)
- **Email** : `admin@academix.com`
- **Mot de passe** : `admin2026`
  _(Ce flux permet la gestion globale de l'établissement: départements, configurations système, etc.)_

https://github.com/user-attachments/assets/02cf5b8d-6dbd-422a-b796-31fe51bf401f

### 2️⃣ Flux Chef de Département

- **Lien de connexion** : [https://team-d-excellence-hackbyifri-2026.vercel.app/login](https://team-d-excellence-hackbyifri-2026.vercel.app/login)
- **Email** : `mourchid@academix.com`
- **Mot de passe** : `mourchid2026`
  _(Ce flux permet l'import et la gestion des étudiants d'une filière, ainsi que l'assignation des notes et emplois du temps.)_

https://github.com/user-attachments/assets/2bca6ac0-dc22-40e8-a51d-d1c8c023d3f0

### 3️⃣ Flux Étudiant

- **Lien de connexion** : [https://team-d-excellence-hackbyifri-2026.vercel.app/login](https://team-d-excellence-hackbyifri-2026.vercel.app/login)
- **Identifiant** : `ETU002`
- **Mot de passe** : `ETU002`
  _(Ce flux donne l'accès au tableau de bord de l'étudiant, avec ses notes, son emploi du temps et les modules d'Intelligence Artificielle.)_

https://github.com/user-attachments/assets/b5c4a33e-2e9b-41ad-b384-f3311012edd5

---

## ✨ Fonctionnalités Clés : IA & Collaboration Sociale

AcademiX intègre de puissants outils d'Intelligence Artificielle et de collaboration en temps réel pour transformer l'expérience d'apprentissage des étudiants. Ces fonctionnalités sont accessibles via le tableau de bord Étudiant.

### 🧠 Modules d'Intelligence Artificielle (AI Revision Portal)

Depuis l'espace AI Revision, l'étudiant peut sélectionner ses propres modules et cours pour générer du contenu pédagogique avancé et sur mesure.

https://github.com/user-attachments/assets/e8252865-554e-44ed-8b85-dad4d6351c2b

- **📄 Génération de Résumés (Smart Summary)** : Synthétisez instantanément de longs cours en fiches de révision structurées, mettant en évidence les concepts clés et formules importantes.
- **🎙️ Création de Podcasts (Audio Learning)** : Générez des podcasts audio immersifs à partir de vos notes de cours (générés grâce à un modèle d'IA Text-To-Speech) pour réviser "les mains libres" dans les transports ou pendant le sport.
- **✅ Génération de Quiz (Smart Testing)** : Testez vos connaissances et préparez vos examens grâce à la génération automatique de QCM pertinents basés sur le contexte précis de vos supports de cours.
- **📝 Exercices d'Application** : L'IA analyse votre cours et génère des exercices pratiques inédits accompagnés de leurs corrigés détaillés étape par étape.
- **👨‍🏫 Professeur IA** : Posez des questions directement à notre assistant IA spécialisé, qui agit comme votre tuteur personnel, et obtenez des réponses basées uniquement sur le contenu de votre base de connaissance validée.




### 🤝 Sessions Collaboratives en Temps Réel

L'apprentissage n'est plus solitaire. Depuis l'onglet Sessions Collaboratives, les étudiants rejoignent des "salles d'étude virtuelles" connectées en direct par WebSocket :

https://github.com/user-attachments/assets/da420c7b-e3dd-4847-bffb-a0fc7175dc6a


- **💬 Chat de Groupe Temps Réel** : Discutez instantanément avec vos camarades connectés dans la même session de travail pour vous entraider.
- **✏️ Tableau Blanc Partagé (Whiteboard)** : Dessinez des schémas, tracez des graphes ou expliquez visuellement des concepts à distance ; tous les participants voient les traits se dessiner en temps réel (synchronisation bidirectionnelle très basse latence).
- **💻 Éditeur de Code Collaboratif** : Un véritable IDE intégré au navigateur, où plusieurs étudiants peuvent taper du code simultanément (mode "Google Docs"), ce qui est idéal pour les TP d'informatique et corrections de bugs en groupe.

---

## 🏗️ Architecture

- **Frontend**: React 18 + Vite 5 + Tailwind CSS 3
- **Backend API**: Laravel 12 (PHP 8.2) + Sanctum
- **Backend WebSocket**: Node.js 20 + Socket.io + MongoDB
- **Service IA**: Python 3.11 + FastAPI + OpenRouter/HuggingFace/Groq
- **Base de données**: MySQL 8.0

---

## 📦 Installation pour Développeurs

Si vous souhaitez faire tourner toutes les briques de l'application en local :

### Prérequis

- **PHP** >= 8.2 (avec extensions : mbstring, xml, pdo, mysql)
- **Composer** >= 2.x
- **Node.js** >= 20.x + npm
- **Python** >= 3.11 + pip
- **MySQL** >= 8.0
- **MongoDB** (optionnel pour WebSocket)
- **Git**

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/octavebahoun/TEAM_D-EXCELLENCE_HACKBYIFRI_2026.git
cd TEAM_D-EXCELLENCE_HACKBYIFRI_2026
```

### 2️⃣ Configuration de la base de données MySQL

```bash
# Se connecter à MySQL
sudo mysql -u root -p

# Créer la base de données et l'utilisateur
CREATE DATABASE academix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'academix_user'@'localhost' IDENTIFIED BY 'VotreMotDePasseSecurise!';
GRANT ALL PRIVILEGES ON academix.* TO 'academix_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3️⃣ Installation Backend Laravel

```bash
cd backend/laravel

# Installer les dépendances
composer install
npm install

# Configurer l'environnement
cp .env.example .env

# Éditer .env avec vos paramètres MySQL (ex: DB_DATABASE=academix, DB_USERNAME, DB_PASSWORD)

# Générer la clé d'application
php artisan key:generate

# Exécuter les migrations et injecter les jeux de données (seeders)
php artisan migrate --seed
```

### 4️⃣ Installation Service Node.js (WebSocket)

```bash
cd ../../backend/node

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
```

### 5️⃣ Installation Service Python (IA)

```bash
cd ../../python

# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement
cp .env.example .env
```

### 6️⃣ Installation Frontend React

```bash
cd ../../frontend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
```

---

## 🚀 Lancement des services

Chaque composant doit être démarré séparément dans son propre terminal.

#### Terminal 1 - Laravel API (Port 8000)

```bash
cd backend/laravel
php artisan serve
```

#### Terminal 2 - Node.js WebSocket (Port 3001)

```bash
cd backend/node
npm run dev
```

#### Terminal 3 - Python FastAPI (Port 5000)

```bash
cd python
source venv/bin/activate
uvicorn main:app --reload --port 5000
```

#### Terminal 4 - Frontend React (Port 5173)

```bash
cd frontend
npm run dev
```

---

## 📚 Documentation

Consultez le dossier [`/docs`](./docs/) pour la documentation complète :

### 🚀 Guides de Démarrage

- **[README](./docs/README.md)** - Point d'entrée de la documentation détaillée
- **[Installation](./docs/INSTALLATION.md)** - Setup complet développement local
- **[Fonctionnalités MVP](./docs/FEATURES_MVP.md)** - Features prioritaires et différenciateurs

### 🏗️ Architecture & Technique

- **[Architecture](./docs/ARCHITECTURE.md)** - Microservices, diagrammes, stack
- **[API](./docs/API.md)** - Endpoints Laravel, Python, WebSocket Node.js
- **[Base de Données](./docs/DATABASE.md)** - Schéma, tables, relations

### 📖 Guides Utilisateur & Déploiement

- **[Parcours Utilisateur](./docs/USER_JOURNEY.md)** - Flow complet de l'étudiant

---

## 🎯 URLs en local

- **Frontend** : http://localhost:5173
- **Laravel API** : http://localhost:8000
- **Node WebSocket** : http://localhost:3001
- **Python IA** : http://localhost:5000

---

## 🔥 Défis Techniques Relevés

Lors du hackathon, nous avons surmonté plusieurs défis majeurs :

- **Collaboration Temps Réel** : Intégration de WebSockets avec React et Node.js pour une synchronisation fluide et à très basse latence sur l'éditeur de code et le tableau blanc.
- **Microservices et IA** : Orchestration efficace d'un backend Laravel pour la logique métier avec un service Python (FastAPI) dédié au traitement lourd de l'IA générative.
- **Multi-modèles IA** : Gestion dynamique et rapide de différents LLMs (OpenRouter, Groq) pour répondre précisément aux besoins spécifiques de chaque fonctionnalité.

---

## 👥 Équipe "Team D'excellence"

- **Hanna BIAOU** - Frontend & Designer(React)
- **Mourchid FOLARIN** - Backend (Laravel)
- **Octave BAHOUN-HOUTOUKPE** - Fullstack (Node.js + Python IA)

---

**Date de validation MVP** : 24 Février 2026
Projet développé dans le cadre du **HackByIFRI 2026** par **Team D'excellence**.
