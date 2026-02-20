# 📦 Guide d'Installation - AcademiX Platform

## Prérequis Système

### Obligatoires

- **OS**: Linux (Ubuntu 22.04+), macOS, ou Windows (WSL2)
- **PHP**: 8.2+ avec extensions (voir ci-dessous)
- **Node.js**: 20.x LTS
- **Python**: 3.11+
- **MySQL**: 8.0+
- **Composer**: 2.x
- **Git**: Latest

### Optionnels

- **Redis**: 7.x (pour cache & WebSocket scaling)
- **Docker**: 24.x (déploiement conteneurisé)

---

## 🔧 Installation des Dépendances

### 1. PHP & Extensions

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install -y php8.2 php8.2-cli php8.2-fpm \
    php8.2-mysql php8.2-mbstring php8.2-xml \
    php8.2-curl php8.2-zip php8.2-gd php8.2-bcmath \
    php8.2-intl php8.2-redis

# Vérifier
php -v
php -m | grep -E 'mysql|mbstring|xml|curl'
```

**macOS (Homebrew):**

```bash
brew install php@8.2
brew services start php@8.2
```

---

### 2. Composer

```bash
# Ubuntu/Debian
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php
sudo mv composer.phar /usr/local/bin/composer
php -r "unlink('composer-setup.php');"

# Vérifier
composer --version
```

---

### 3. Node.js & npm

**Ubuntu/Debian:**

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier
node -v  # v20.x.x
npm -v   # 10.x.x
```

**macOS:**

```bash
brew install node@20
```

---

### 4. Python

**Ubuntu/Debian:**

```bash
sudo apt install -y python3.11 python3.11-venv python3-pip

# Vérifier
python3 --version  # Python 3.11.x
```

**macOS:**

```bash
brew install python@3.11
```

---

### 5. MySQL

**Ubuntu/Debian:**

```bash
sudo apt install -y mysql-server mysql-client

# Démarrer MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Sécuriser
sudo mysql_secure_installation
```

**macOS:**

```bash
brew install mysql@8.0
brew services start mysql
```

**Créer la base de données:**

```bash
sudo mysql <<EOF
CREATE DATABASE academix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'academix_user'@'localhost' IDENTIFIED BY 'Academix2026Strong!';
GRANT ALL PRIVILEGES ON academix.* TO 'academix_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
```

---

### 6. Redis (Optionnel mais recommandé)

**Ubuntu/Debian:**

```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Vérifier
redis-cli ping  # PONG
```

**macOS:**

```bash
brew install redis
brew services start redis
```

---

## 📥 Cloner le Projet

```bash
cd ~/
git clone https://github.com/octavebahoun/TEAM_D-EXCELLENCE_HACKBYIFRI_2026.git
cd TEAM_D-EXCELLENCE_HACKBYIFRI_2026
```

---

## 🚀 Installation Automatique (Recommandé)

```bash
chmod +x setup_all.sh
./setup_all.sh
```

Ce script va :

1. ✅ Installer les dépendances Laravel (Composer)
2. ✅ Installer les dépendances Node.js (npm)
3. ✅ Créer l'environnement virtuel Python
4. ✅ Installer les packages Python
5. ✅ Configurer les fichiers `.env`
6. ✅ Générer les clés Laravel
7. ✅ Exécuter les migrations
8. ✅ Builder le frontend

---

## 🔨 Installation Manuelle (Étape par Étape)

### 1. Backend Laravel

```bash
cd backend/laravel

# Installer les dépendances
composer install

# Copier le fichier .env
cp .env.example .env

# Éditer .env avec vos paramètres
nano .env
```

**Configuration `.env` Laravel:**

```env
APP_NAME="AcademiX API"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=academix
DB_USERNAME=academix_user
DB_PASSWORD=Academix2026Strong!

PYTHON_AI_SERVICE_URL=http://localhost:5000
NODE_SOCKET_SERVICE_URL=http://localhost:3001
```

**Générer la clé Laravel:**

```bash
php artisan key:generate
```

**Exécuter les migrations:**

```bash
php artisan migrate
```

**Optionnel: Seeder avec données de test:**

```bash
php artisan db:seed
```

---

### 2. Backend Node.js (WebSocket)

```bash
cd ../node

# Installer les dépendances
npm install

# Copier le fichier .env
cp .env.example .env

# Éditer .env
nano .env
```

**Configuration `.env` Node.js:**

```env
PORT=3001
NODE_ENV=development

# JWT Secret (générer avec: openssl rand -base64 32)
JWT_SECRET=your_super_secret_jwt_key_here

# Laravel API
LARAVEL_API_URL=http://localhost:8000

# Redis (si utilisé)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

---

### 3. Service IA Python

```bash
cd ../../python

# Créer l'environnement virtuel
python3 -m venv venv

# Activer l'environnement
source venv/bin/activate  # Linux/macOS
# OU
venv\Scripts\activate     # Windows

# Installer les dépendances
pip install -r requirements.txt

# Copier le fichier .env
cp .env.example .env

# Éditer .env
nano .env
```

**Configuration `.env` Python:**

```env
# API Keys
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...

# API Settings
API_KEY=your_python_api_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8000

# Paths
UPLOAD_DIR=./uploads
GENERATED_DIR=./generated
```

**Créer les dossiers:**

```bash
mkdir -p uploads generated
```

---

### 4. Frontend React

```bash
cd ../frontend

# Installer les dépendances
npm install

# Copier le fichier .env
cp .env.example .env

# Éditer .env
nano .env
```

**Configuration `.env` Frontend:**

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:3001
VITE_PYTHON_API_URL=http://localhost:5000/api/v1
```

**Builder (optionnel en dev):**

```bash
npm run build
```

---

## 🎯 Vérification de l'Installation

### Vérifier Laravel

```bash
cd backend/laravel
php artisan --version
php artisan migrate:status
```

### Vérifier Node.js

```bash
cd backend/node
npm list --depth=0
```

### Vérifier Python

```bash
cd python
source venv/bin/activate
python -c "import fastapi; print(fastapi.__version__)"
```

### Vérifier Frontend

```bash
cd frontend
npm list react
```

---

## 🚀 Lancer Tous les Services

### Option 1: Script Automatique

```bash
cd /home/octave/Bureau/hackaton
chmod +x start-all.sh
./start-all.sh
```

### Option 2: Manuellement (4 terminaux)

**Terminal 1 - Laravel:**

```bash
cd backend/laravel
php artisan serve
# → http://localhost:8000
```

**Terminal 2 - Node.js:**

```bash
cd backend/node
npm run dev
# → http://localhost:3001
```

**Terminal 3 - Python:**

```bash
cd python
source venv/bin/activate
uvicorn main:app --reload --port 5000
# → http://localhost:5000
```

**Terminal 4 - Frontend:**

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

---

## 🧪 Tester les APIs

### Laravel API

```bash
curl http://localhost:8000/api/v1/health
```

### Python API

```bash
curl http://localhost:5000/health
```

### WebSocket (avec wscat)

```bash
npm install -g wscat
wscat -c ws://localhost:3001
```

---

## 🐛 Dépannage

### Erreur: "Class 'ZipArchive' not found"

```bash
sudo apt install php8.2-zip
```

### Erreur: "PDOException: could not find driver"

```bash
sudo apt install php8.2-mysql
```

### Erreur: Port déjà utilisé

```bash
# Trouver le processus
sudo lsof -i :8000
# Tuer le processus
kill -9 <PID>
```

### Erreur: Permission denied (uploads/)

```bash
cd python
chmod 777 uploads generated
```

### MySQL: Access denied

```bash
# Reset mot de passe
sudo mysql
ALTER USER 'academix_user'@'localhost' IDENTIFIED BY 'NewPassword123!';
FLUSH PRIVILEGES;
```

---

## 🔒 Sécurité (Développement Local)

### Générer des secrets sécurisés

**JWT Secret:**

```bash
openssl rand -base64 32
```

**API Key:**

```bash
openssl rand -hex 32
```

**Laravel APP_KEY:**

```bash
cd backend/laravel
php artisan key:generate
```

---

## 📝 Fichiers `.env` à Créer

1. `/backend/laravel/.env`
2. `/backend/node/.env`
3. `/python/.env`
4. `/frontend/.env`

**Important:** Ne JAMAIS commit les fichiers `.env` ! Ils sont dans `.gitignore`.

---

## ✅ Checklist Post-Installation

- [ ] PHP 8.2+ installé avec toutes les extensions
- [ ] Composer installé
- [ ] Node.js 20.x installé
- [ ] Python 3.11+ installé
- [ ] MySQL 8.0+ installé et configuré
- [ ] Base de données `academix` créée
- [ ] Utilisateur MySQL créé avec privilèges
- [ ] Redis installé (optionnel)
- [ ] Dépendances Laravel installées (`vendor/`)
- [ ] Dépendances Node installées (`node_modules/`)
- [ ] Environnement virtuel Python créé (`venv/`)
- [ ] Packages Python installés
- [ ] Fichiers `.env` configurés (4 fichiers)
- [ ] Migrations Laravel exécutées
- [ ] Clé Laravel générée
- [ ] Tous les services démarrent sans erreur

---

## 🎓 Prochaines Étapes

1. Consulter [API.md](./API.md) pour la documentation des endpoints
2. Lire [ARCHITECTURE.md](./ARCHITECTURE.md) pour comprendre la structure
3. Voir [USER_JOURNEY.md](./USER_JOURNEY.md) pour les cas d'usage

---

**Besoin d'aide ?** Consulter la section Dépannage ou créer une issue GitHub.

**Dernière mise à jour**: 16 février 2026  
**Version**: 1.0.0
