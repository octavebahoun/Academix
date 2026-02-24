# 🚀 AcademiX Platform

Plateforme académique intelligente avec IA générative pour gérer et optimiser la vie des établissements scolaires, des formateurs et des étudiants.

## 🌟 Démonstration en Ligne (Déploiement)

Vous pouvez tester l'application directement en ligne. Nous avons mis en place **trois parcours (flux)** accessibles via le lien de connexion principal :

### 1️⃣ Flux Administrateur Principal

- **Lien de connexion** : [https://team-d-excellence-hackbyifri-2026.vercel.app/login](https://team-d-excellence-hackbyifri-2026.vercel.app/login)
- **Email** : `admin@academix.com`
- **Mot de passe** : `admin2026`
  _(Ce flux permet la gestion globale de l'établissement: départements, configurations système, etc.)_

<video src="./Présentation/presentation1.mp4" controls="controls" width="100%"></video>

### 2️⃣ Flux Chef de Département

- **Lien de connexion** : [https://team-d-excellence-hackbyifri-2026.vercel.app/login](https://team-d-excellence-hackbyifri-2026.vercel.app/login)
- **Email** : `mourchid@academix.com`
- **Mot de passe** : `mourchid2026`
  _(Ce flux permet l'import et la gestion des étudiants d'une filière, ainsi que l'assignation des notes et emplois du temps.)_

<video src="./Présentation/presentation2.mp4" controls="controls" width="100%"></video>

### 3️⃣ Flux Étudiant

- **Lien de connexion** : [https://team-d-excellence-hackbyifri-2026.vercel.app/login](https://team-d-excellence-hackbyifri-2026.vercel.app/login)
- **Identifiant** : `ETU001`
- **Mot de passe** : `ETU001`
  _(Ce flux donne l'accès au tableau de bord de l'étudiant, avec ses notes, son emploi du temps et les modules d'Intelligence Artificielle.)_

<video src="./Présentation/presentation3.mp4" controls="controls" width="100%"></video>

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

## 👥 Équipe "Team D'excellence"

- **Hanna BIAOU** - Frontend & Designer(React)
- **Mourchid FOLARIN** - Backend (Laravel)
- **Octave BAHOUN-HOUTOUKPE** - Fullstack (Node.js + Python IA)

---

**Date de validation MVP** : 24 Février 2026
Projet développé dans le cadre du **HackByIFRI 2026** par **Team D'excellence**.
