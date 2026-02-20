# 🚀 AcademiX Platform

Plateforme académique intelligente avec IA générative pour étudiants.

## 🏗️ Architecture

- **Frontend**: React 18 + Vite 5 + Tailwind CSS 3
- **Backend API**: Laravel 11 (PHP 8.2) + Sanctum
- **Backend WebSocket**: Node.js 20 + Socket.io + MongoDB
- **Service IA**: Python 3.11 + FastAPI + OpenAI/Claude
- **Base de données**: MySQL 8.0

---

## 📦 Installation pour Développeurs

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

# Éditer .env avec vos paramètres MySQL :
# DB_DATABASE=academix
# DB_USERNAME=academix_user
# DB_PASSWORD=VotreMotDePasseSecurise!

# Générer la clé d'application
php artisan key:generate

# Exécuter les migrations
php artisan migrate

# (Optionnel) Remplir avec des données de test
php artisan db:seed
```

### 4️⃣ Installation Service Node.js (WebSocket)

```bash
cd ../../backend/node

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Éditer .env avec vos paramètres
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

# Éditer .env avec vos clés API (OpenAI, Claude, etc.)
```

### 6️⃣ Installation Frontend React

```bash
cd ../frontend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
```

---

## 🚀 Lancement des services

### Méthode 1: Script automatique (recommandé)

```bash
./start-all.sh
```

### Méthode 2: Lancement manuel

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

## 📚 Documentation

Consultez le dossier [/docs](./docs/) pour la documentation complète :

### 🚀 Guides de Démarrage

- **[README](./docs/README.md)** - Point d'entrée de la documentation
- **[Installation](./docs/INSTALLATION.md)** - Setup complet développement local
- **[Fonctionnalités MVP](./docs/FEATURES_MVP.md)** - Features prioritaires et différenciateurs

### 🏗️ Architecture & Technique

- **[Architecture](./docs/ARCHITECTURE.md)** - Microservices, diagrammes, stack
- **[API](./docs/API.md)** - Endpoints Laravel, Python, WebSocket Node.js
- **[Base de Données](./docs/DATABASE.md)** - Schéma, tables, relations

### 📖 Guides Utilisateur & Déploiement

- **[Parcours Utilisateur](./docs/USER_JOURNEY.md)** - Flow complet de l'étudiant
- **[Déploiement](./docs/DEPLOYMENT.md)** - Guide production (VPS, Cloud)

## 🎯 URLs en locale

- Frontend: http://localhost:5173
- Laravel API: http://localhost:8000
- Node WebSocket: http://localhost:3001
- Python IA: http://localhost:5000

## 👥 Équipe

- Hanna BIAOU - Frontend (React)
- Mourchid FOLARIN - Backend (Laravel)
- Octave BAHOUN-HOUTOUKPE - Backend (Node.js + Python IA)

---

Projet Hackathon 2 semaines 🔥
