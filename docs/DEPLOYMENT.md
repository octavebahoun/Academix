# 🚀 Guide de Déploiement - AcademiX Platform

## Vue d'Ensemble

Ce guide couvre le déploiement en production d'AcademiX avec :

- Frontend React sur **Vercel** ou **Netlify**
- Backend Laravel sur **VPS** (DigitalOcean, Linode) ou **Laravel Forge**
- Service Python sur **Railway** ou **Heroku**
- Service Node.js sur même VPS que Laravel
- Base MySQL sur **PlanetScale** ou VPS

---

## 🎯 Architectures de Déploiement

### Option 1: Cloud Hybride (Recommandé)

```
Frontend → Vercel (CDN global)
Backend Laravel → VPS Ubuntu 22.04
Backend Node.js → Même VPS (process séparé)
Python FastAPI → Railway
MySQL → PlanetScale (ou VPS)
Redis → Upstash (ou VPS)
```

**Avantages:**

- ✅ Frontend ultra-rapide (CDN)
- ✅ Python scaling automatique
- ✅ Coût modéré (~30$/mois)

---

### Option 2: VPS Tout-en-Un (Économique)

```
Tout sur 1 VPS:
├── Nginx (reverse proxy)
├── Laravel (PM2 / Supervisor)
├── Node.js (PM2)
├── Python (Gunicorn + Supervisor)
├── MySQL
├── Redis
└── Frontend build (servi par Nginx)
```

**Avantages:**

- ✅ Coût minimal (~10$/mois)
- ✅ Contrôle total
- ❌ Scaling limité

---

### Option 3: Docker Compose (Flexible)

```yaml
services:
  - frontend (Nginx)
  - laravel (PHP-FPM)
  - node
  - python
  - mysql
  - redis
```

**Avantages:**

- ✅ Portable
- ✅ Facile à dupliquer
- ✅ CI/CD simplifié

---

## 📦 Déploiement Frontend (Vercel)

### 1. Préparation

**Fichier `frontend/vercel.json`:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 2. Variables d'environnement Vercel

```bash
VITE_API_URL=https://api.academix.com/api/v1
VITE_SOCKET_URL=https://socket.academix.com
VITE_PYTHON_API_URL=https://ia.academix.com/api/v1
```

### 3. Déploiement

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
cd frontend
vercel --prod
```

**OU via GitHub:**

1. Push sur GitHub
2. Connecter repo sur vercel.com
3. Auto-deploy sur chaque push

---

## 🖥️ Déploiement Backend Laravel (VPS)

### 1. Prérequis VPS

**Specs minimum:**

- **CPU**: 2 vCPU
- **RAM**: 4 GB
- **Storage**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS

### 2. Installation des dépendances

```bash
# Se connecter au VPS
ssh root@your-vps-ip

# Mise à jour système
apt update && apt upgrade -y

# Installer PHP 8.2 & extensions
add-apt-repository ppa:ondrej/php -y
apt install -y php8.2 php8.2-fpm php8.2-cli php8.2-mysql \
    php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip \
    php8.2-gd php8.2-bcmath php8.2-intl php8.2-redis

# Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Nginx
apt install -y nginx

# MySQL
apt install -y mysql-server
mysql_secure_installation

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Redis
apt install -y redis-server
systemctl enable redis-server

# Supervisor (process manager)
apt install -y supervisor

# Certbot (SSL)
apt install -y certbot python3-certbot-nginx
```

### 3. Configuration MySQL

```bash
mysql -u root -p

CREATE DATABASE academix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'academix_prod'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON academix.* TO 'academix_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Déploiement Laravel

```bash
# Créer utilisateur dédié
adduser academix
usermod -aG www-data academix

# Se connecter en tant que academix
su - academix

# Cloner le projet
git clone https://github.com/octavebahoun/TEAM_D-EXCELLENCE_HACKBYIFRI_2026.git
cd TEAM_D-EXCELLENCE_HACKBYIFRI_2026/backend/laravel

# Installer dépendances
composer install --optimize-autoloader --no-dev

# Configuration .env
cp .env.example .env
nano .env
```

**Fichier `.env` production:**

```env
APP_NAME="AcademiX API"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.academix.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=academix
DB_USERNAME=academix_prod
DB_PASSWORD=STRONG_PASSWORD_HERE

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

PYTHON_AI_SERVICE_URL=https://ia.academix.com
NODE_SOCKET_SERVICE_URL=https://socket.academix.com
```

```bash
# Générer clé
php artisan key:generate

# Optimisations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrations
php artisan migrate --force

# Permissions
sudo chown -R academix:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 5. Configuration Nginx

**Fichier `/etc/nginx/sites-available/academix-api`:**

```nginx
server {
    listen 80;
    server_name api.academix.com;

    root /home/academix/TEAM_D-EXCELLENCE_HACKBYIFRI_2026/backend/laravel/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

```bash
# Activer le site
ln -s /etc/nginx/sites-available/academix-api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# SSL avec Let's Encrypt
certbot --nginx -d api.academix.com
```

### 6. Supervisor pour Laravel Queue

**Fichier `/etc/supervisor/conf.d/laravel-worker.conf`:**

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/academix/TEAM_D-EXCELLENCE_HACKBYIFRI_2026/backend/laravel/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=academix
numprocs=2
redirect_stderr=true
stdout_logfile=/home/academix/laravel-worker.log
stopwaitsecs=3600
```

```bash
supervisorctl reread
supervisorctl update
supervisorctl start laravel-worker:*
```

---

## 🐍 Déploiement Python FastAPI (Railway)

### 1. Préparation

**Fichier `python/railway.json`:**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100
  }
}
```

**Fichier `python/runtime.txt`:**

```
python-3.11.7
```

### 2. Variables d'environnement Railway

```bash
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
API_KEY=your_secure_api_key_here
ALLOWED_ORIGINS=https://academix.com,https://api.academix.com
```

### 3. Déploiement

1. Créer compte sur railway.app
2. Connecter repo GitHub
3. Sélectionner dossier `python/`
4. Ajouter les variables d'environnement
5. Deploy automatique

**URL générée**: `https://academix-ia-production.up.railway.app`

---

## ⚡ Déploiement Node.js WebSocket (VPS)

### 1. Installation

```bash
su - academix
cd ~/TEAM_D-EXCELLENCE_HACKBYIFRI_2026/backend/node

npm ci --production

# .env production
cp .env.example .env
nano .env
```

**Fichier `.env`:**

```env
PORT=3001
NODE_ENV=production
JWT_SECRET=your_super_long_jwt_secret_here
LARAVEL_API_URL=https://api.academix.com
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 2. PM2 Process Manager

```bash
# Installer PM2 globalement
sudo npm install -g pm2

# Démarrer l'app
pm2 start src/server.js --name academix-socket

# Auto-restart au boot
pm2 startup
pm2 save

# Monitoring
pm2 monit
```

### 3. Nginx pour WebSocket

**Fichier `/etc/nginx/sites-available/academix-socket`:**

```nginx
upstream socket_backend {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name socket.academix.com;

    location / {
        proxy_pass http://socket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/academix-socket /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
certbot --nginx -d socket.academix.com
```

---

## 🗄️ Base de Données (PlanetScale)

### Option Cloud: PlanetScale

1. Créer compte sur planetscale.com
2. Créer database `academix`
3. Copier connection string
4. Mettre à jour `.env` Laravel

**Connection string:**

```env
DB_CONNECTION=mysql
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_DATABASE=academix
DB_USERNAME=...
DB_PASSWORD=...
MYSQL_ATTR_SSL_CA=/etc/ssl/certs/ca-certificates.crt
```

---

## 🔄 CI/CD avec GitHub Actions

**Fichier `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: cd frontend && npm ci && npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: academix
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd ~/TEAM_D-EXCELLENCE_HACKBYIFRI_2026
            git pull origin main
            cd backend/laravel
            composer install --no-dev
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            sudo systemctl reload php8.2-fpm
```

---

## 📊 Monitoring & Logs

### Laravel Logs

```bash
tail -f /home/academix/.../backend/laravel/storage/logs/laravel.log
```

### Node.js Logs (PM2)

```bash
pm2 logs academix-socket
pm2 logs academix-socket --lines 100
```

### Nginx Logs

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔒 Sécurité Production

### Checklist

- [ ] `APP_DEBUG=false` dans `.env`
- [ ] HTTPS activé (Let's Encrypt)
- [ ] Firewall configuré (UFW)
- [ ] Mots de passe forts (MySQL, Redis)
- [ ] SSH avec clés (désactiver password auth)
- [ ] Rate limiting activé (Laravel Throttle)
- [ ] CORS configuré correctement
- [ ] Headers sécurité (CSP, HSTS)
- [ ] Backups automatiques DB
- [ ] Monitoring actif (UptimeRobot, etc.)

### Firewall (UFW)

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw enable
ufw status
```

---

## 🔄 Mises à Jour

```bash
# Backend Laravel
cd ~/TEAM_D-EXCELLENCE_HACKBYIFRI_2026
git pull origin main
cd backend/laravel
composer install --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
sudo systemctl reload php8.2-fpm

# Node.js
cd ~/TEAM_D-EXCELLENCE_HACKBYIFRI_2026/backend/node
npm ci --production
pm2 restart academix-socket
```

---

## 📋 Checklist Pré-Déploiement

- [ ] Tests passent en local
- [ ] Variables `.env` production configurées
- [ ] Clés API valides (OpenAI, Anthropic)
- [ ] DNS configurés (A records)
- [ ] SSL certificates générés
- [ ] Migrations testées
- [ ] Backups DB en place
- [ ] Monitoring configuré
- [ ] Logs accessibles
- [ ] Plan de rollback prêt

---

**Dernière mise à jour**: 24 février 2026  
**Version**: 1.0.0
