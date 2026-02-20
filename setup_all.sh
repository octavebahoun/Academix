#!/bin/bash

# ============================================
# 🚀 ACADEMIX PLATFORM - SETUP AUTOMATIQUE
# ============================================
# Script pour setup complet du projet en 2 minutes
# Hackathon 2 semaines - Let's go fast! 🔥

set -e  # Exit on error

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
ROCKET="🚀"
FOLDER="📁"
WRENCH="🔧"
PACKAGE="📦"
DATABASE="🗄️"
FIRE="🔥"

# ============================================
# FONCTIONS UTILITAIRES
# ============================================

print_header() {
    echo ""
    echo -e "${PURPLE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}  ${ROCKET} ${CYAN}$1${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}${WRENCH} $1...${NC}"
}

print_success() {
    echo -e "${GREEN}${CHECK} $1${NC}"
}

print_error() {
    echo -e "${RED}❌ ERREUR: $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

ask_question() {
    echo -e "${CYAN}❓ $1${NC}"
    read -p "   Réponse: " response
    echo "$response"
}

confirm() {
    echo -e "${YELLOW}$1 (y/n)${NC}"
    read -p "   " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# ============================================
# VÉRIFICATIONS PRÉALABLES
# ============================================

check_requirements() {
    print_header "Vérification des prérequis"
    
    local missing_tools=()
    
    # Node.js
    if ! command -v node &> /dev/null; then
        missing_tools+=("Node.js (https://nodejs.org)")
    else
        print_success "Node.js $(node -v) installé"
    fi
    
    # npm
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    else
        print_success "npm $(npm -v) installé"
    fi
    
    # PHP
    if ! command -v php &> /dev/null; then
        missing_tools+=("PHP (https://php.net)")
    else
        print_success "PHP $(php -v | head -n 1 | cut -d ' ' -f 2) installé"
    fi
    
    # Composer
    if ! command -v composer &> /dev/null; then
        missing_tools+=("Composer (https://getcomposer.org)")
    else
        print_success "Composer installé"
    fi
    
    # Python
    if ! command -v python3 &> /dev/null; then
        missing_tools+=("Python 3 (https://python.org)")
    else
        print_success "Python $(python3 --version | cut -d ' ' -f 2) installé"
    fi
    
    # pip
    if ! command -v pip3 &> /dev/null; then
        missing_tools+=("pip3")
    else
        print_success "pip3 installé"
    fi
    
    # Git
    if ! command -v git &> /dev/null; then
        missing_tools+=("Git")
    else
        print_success "Git installé"
    fi
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        print_error "Outils manquants:"
        for tool in "${missing_tools[@]}"; do
            echo "   - $tool"
        done
        echo ""
        echo "Installe ces outils avant de continuer."
        exit 1
    fi
    
    print_success "Tous les prérequis sont installés! ${FIRE}"
    echo ""
}

# ============================================
# CRÉATION DE LA STRUCTURE
# ============================================

create_structure() {
    print_header "Création de la structure du projet"
    
    print_step "Création des dossiers principaux"
    mkdir -p backend/laravel backend/node frontend python docs
    print_success "Structure créée"
}

# ============================================
# SETUP FRONTEND
# ============================================

setup_frontend() {
    print_header "Setup Frontend (React + Vite)"
    
    if [ -d "frontend/node_modules" ]; then
        print_warning "Frontend déjà installé, skip..."
        return
    fi
    
    cd frontend
    
    # Créer package.json si n'existe pas
    if [ ! -f "package.json" ]; then
        print_step "Initialisation du projet React"
        npm create vite@latest . -- --template react
    fi
    
    print_step "Installation des dépendances"
    npm install
    
    print_step "Installation des packages additionnels"
    npm install react-router-dom zustand axios socket.io-client
    npm install @headlessui/react @heroicons/react
    npm install recharts date-fns
    npm install react-hot-toast
    
    print_step "Installation Tailwind CSS"
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    
    print_step "Création de la structure de dossiers"
    mkdir -p src/{components/{common,dashboard,notes,calendar,ai,sessions,profile,alerts,statistics},pages,services,store,utils,hooks,routes,styles,assets/{images,icons}}
    
    # Créer les fichiers de base
    touch src/services/{api,authService,notesService,tasksService,sessionsService,aiService,socket}.js
    touch src/store/{index,authStore,notesStore,tasksStore,sessionsStore}.js
    touch src/utils/{constants,helpers,validators}.js
    touch src/hooks/{useAuth,useSocket,useDebounce}.js
    touch src/routes/AppRoutes.jsx
    
    # Créer .env
    cat > .env << 'EOF'
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:3001
EOF
    
    cat > .env.example << 'EOF'
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:3001
EOF
    
    print_success "Frontend configuré! ${CHECK}"
    cd ..
}

# ============================================
# SETUP BACKEND LARAVEL
# ============================================

setup_laravel() {
    print_header "Setup Backend Laravel"
    
    cd backend
    
    if [ -d "laravel/vendor" ]; then
        print_warning "Laravel déjà installé, skip..."
        cd ..
        return
    fi
    
    print_step "Création du projet Laravel"
    composer create-project laravel/laravel laravel --quiet
    cd laravel
    
    print_step "Installation de Sanctum"
    composer require laravel/sanctum --quiet
    php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider" --quiet
    
    print_step "Création de la structure"
    mkdir -p app/Services
    mkdir -p storage/app/public/{pdfs,generated}
    
    # Créer .env
    cat > .env << 'EOF'
APP_NAME="AcademiX API"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=academix
DB_USERNAME=root
DB_PASSWORD=

# Service URLs
PYTHON_AI_SERVICE_URL=http://localhost:5000
NODE_SOCKET_SERVICE_URL=http://localhost:3001

# API Keys (à remplir)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
EOF
    
    # Générer clé app
    php artisan key:generate --quiet
    
    print_success "Laravel configuré! ${CHECK}"
    cd ../..
}

# ============================================
# SETUP BACKEND NODE.JS
# ============================================

setup_node() {
    print_header "Setup Backend Node.js (WebSocket)"
    
    cd backend
    
    if [ ! -d "node" ]; then
        mkdir node
    fi
    cd node
    
    if [ -f "package.json" ]; then
        print_warning "Node.js déjà initialisé, skip..."
        cd ../..
        return
    fi
    
    print_step "Initialisation du projet Node.js"
    npm init -y
    
    print_step "Installation des dépendances"
    npm install express socket.io cors dotenv
    npm install jsonwebtoken bcryptjs
    npm install mongoose
    npm install redis ioredis
    npm install winston
    npm install -D nodemon
    
    print_step "Création de la structure"
    mkdir -p src/{config,controllers,middleware,models,routes,services,utils}
    
    # Créer les fichiers de base
    touch src/server.js
    touch src/config/{database,socket,redis}.js
    touch src/controllers/{chatController,notificationController}.js
    touch src/middleware/{auth,errorHandler}.js
    touch src/models/{Message,Notification}.js
    touch src/routes/{chat,notifications}.js
    touch src/services/socketService.js
    touch src/utils/{logger,jwt}.js
    
    # Créer server.js basique
    cat > src/server.js << 'EOF'
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'AcademiX WebSocket Server', status: 'running' });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
EOF
    
    # Créer .env
    cat > .env << 'EOF'
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=academix
DB_USER=postgres
DB_PASSWORD=

# JWT
JWT_SECRET=your_super_secret_key_change_this

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
FRONTEND_URL=http://localhost:5173
LARAVEL_URL=http://localhost:8000
EOF
    
    cat > .env.example << 'EOF'
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=academix
JWT_SECRET=your_super_secret_key_change_this
FRONTEND_URL=http://localhost:5173
EOF
    
    # Ajouter scripts npm
    npm pkg set scripts.start="node src/server.js"
    npm pkg set scripts.dev="nodemon src/server.js"
    
    print_success "Node.js configuré! ${CHECK}"
    cd ../..
}

# ============================================
# SETUP PYTHON
# ============================================

setup_python() {
    print_header "Setup Python (Service IA)"
    
    cd python
    
    if [ -d "venv" ]; then
        print_warning "Python venv déjà créé, skip..."
        cd ..
        return
    fi
    
    print_step "Création de l'environnement virtuel"
    python3 -m venv venv
    
    print_step "Activation de l'environnement"
    source venv/bin/activate
    
    print_step "Upgrade pip"
    pip install --upgrade pip --quiet
    
    # Créer requirements.txt
    cat > requirements.txt << 'EOF'
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6
python-dotenv==1.0.0
pydantic==2.5.3
pydantic-settings==2.1.0

# PDF Processing
PyPDF2==3.0.1
pdfplumber==0.10.3

# AI APIs
openai==1.10.0
anthropic==0.8.1

# Utils
requests==2.31.0
aiofiles==23.2.1
EOF
    
    print_step "Installation des dépendances Python"
    pip install -r requirements.txt --quiet
    
    print_step "Création de la structure"
    mkdir -p app/{api,core,services,models,utils}
    mkdir -p {tests,uploads,generated}
    
    # Créer les __init__.py
    touch app/__init__.py
    touch app/api/__init__.py
    touch app/core/__init__.py
    touch app/services/__init__.py
    touch app/models/__init__.py
    touch app/utils/__init__.py
    
    # Créer les fichiers
    touch app/api/{routes,dependencies}.py
    touch app/core/{config,security}.py
    touch app/services/{pdf_extractor,text_summarizer,quiz_generator,openai_service,claude_service}.py
    touch app/models/{schemas,responses}.py
    touch app/utils/{file_handler,validators}.py
    
    # Créer main.py
    cat > main.py << 'EOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AcademiX AI Service",
    description="Service IA pour génération de contenu pédagogique",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "AcademiX AI Service", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
EOF
    
    # Créer .env
    cat > .env << 'EOF'
# API Configuration
API_HOST=0.0.0.0
API_PORT=5000
API_RELOAD=True

# Security
API_KEY=your_secret_api_key_change_this

# AI Services (à remplir)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# File Upload
MAX_UPLOAD_SIZE=10485760
ALLOWED_EXTENSIONS=.pdf,.txt

# Paths
UPLOAD_DIR=./uploads
GENERATED_DIR=./generated
EOF
    
    cat > .env.example << 'EOF'
API_HOST=0.0.0.0
API_PORT=5000
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
EOF
    
    deactivate
    
    print_success "Python configuré! ${CHECK}"
    cd ..
}

# ============================================
# CRÉER FICHIERS GLOBAUX
# ============================================

create_global_files() {
    print_header "Création des fichiers globaux"
    
    # .gitignore
    print_step "Création du .gitignore"
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
vendor/
venv/
__pycache__/

# Environment
.env
.env.local

# Build
dist/
build/
*.log

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Uploads
uploads/*
!uploads/.gitkeep
generated/*
!generated/.gitkeep
storage/app/public/pdfs/*
storage/app/public/generated/*

# Laravel
backend/laravel/storage/*.key
backend/laravel/bootstrap/cache/*

# Testing
coverage/
.pytest_cache/
EOF
    
    # README.md
    print_step "Création du README.md"
    cat > README.md << 'EOF'
# 🚀 AcademiX Platform

Plateforme académique intelligente avec IA générative pour étudiants.

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend API**: Laravel (PHP)
- **Backend WebSocket**: Node.js + Socket.io
- **Service IA**: Python + FastAPI

## 🚀 Démarrage rapide

### Installation
```bash
./setup-all.sh
```

### Lancement des services

#### Terminal 1 - Laravel
```bash
cd backend/laravel
php artisan serve
```

#### Terminal 2 - Node.js
```bash
cd backend/node
npm run dev
```

#### Terminal 3 - Python
```bash
cd python
source venv/bin/activate
uvicorn main:app --reload --port 5000
```

#### Terminal 4 - Frontend
```bash
cd frontend
npm run dev
```

## 📚 Documentation

- [Cahier des charges](docs/CHARGES.md)
- [API Documentation](docs/API.md)
- [Guide de déploiement](docs/DEPLOYMENT.md)

## 🎯 URLs

- Frontend: http://localhost:5173
- Laravel API: http://localhost:8000
- Node WebSocket: http://localhost:3001
- Python IA: http://localhost:5000

## 👥 Équipe

- Hanna - Frontend (React)
- Mourchid - Backend (Laravel)
- Toi - Backend (Node.js + Python IA)

---

Projet Hackathon 2 semaines 🔥
EOF
    
    # Script de lancement
    print_step "Création du script de lancement"
    cat > start-all.sh << 'EOF'
#!/bin/bash

echo "🚀 Démarrage de tous les services AcademiX..."

# Ouvrir des terminaux séparés selon l'OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd '"$PWD"'/backend/laravel && php artisan serve"'
    osascript -e 'tell app "Terminal" to do script "cd '"$PWD"'/backend/node && npm run dev"'
    osascript -e 'tell app "Terminal" to do script "cd '"$PWD"'/python && source venv/bin/activate && uvicorn main:app --reload --port 5000"'
    osascript -e 'tell app "Terminal" to do script "cd '"$PWD"'/frontend && npm run dev"'
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $PWD/backend/laravel && php artisan serve; exec bash"
        gnome-terminal -- bash -c "cd $PWD/backend/node && npm run dev; exec bash"
        gnome-terminal -- bash -c "cd $PWD/python && source venv/bin/activate && uvicorn main:app --reload --port 5000; exec bash"
        gnome-terminal -- bash -c "cd $PWD/frontend && npm run dev; exec bash"
    else
        echo "Installe gnome-terminal ou lance manuellement"
    fi
else
    echo "OS non supporté pour lancement automatique"
    echo "Lance manuellement les 4 services dans 4 terminaux"
fi
EOF
    chmod +x start-all.sh
    
    print_success "Fichiers globaux créés! ${CHECK}"
}

# ============================================
# CONFIGURATION INTERACTIVE
# ============================================

interactive_config() {
    print_header "Configuration interactive"
    
    echo -e "${CYAN}Entrons quelques infos pour la configuration...${NC}"
    echo ""
    
    # Database
    DB_NAME=$(ask_question "Nom de la base de données [academix]")
    DB_NAME=${DB_NAME:-academix}
    
    DB_USER=$(ask_question "Utilisateur DB [root]")
    DB_USER=${DB_USER:-root}
    
    DB_PASSWORD=$(ask_question "Mot de passe DB [vide]")
    DB_PASSWORD=${DB_PASSWORD:-}
    
    # Mise à jour des .env
    if [ -f "backend/laravel/.env" ]; then
        sed -i.bak "s/DB_DATABASE=.*/DB_DATABASE=$DB_NAME/" backend/laravel/.env
        sed -i.bak "s/DB_USERNAME=.*/DB_USERNAME=$DB_USER/" backend/laravel/.env
        sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" backend/laravel/.env
        print_success "Laravel .env mis à jour"
    fi
    
    if [ -f "backend/node/.env" ]; then
        sed -i.bak "s/DB_NAME=.*/DB_NAME=$DB_NAME/" backend/node/.env
        sed -i.bak "s/DB_USER=.*/DB_USER=$DB_USER/" backend/node/.env
        sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" backend/node/.env
        print_success "Node .env mis à jour"
    fi
    
    echo ""
    print_warning "N'oublie pas de configurer tes clés API dans les fichiers .env:"
    echo "   - backend/laravel/.env (OPENAI_API_KEY)"
    echo "   - python/.env (OPENAI_API_KEY, ANTHROPIC_API_KEY)"
}

# ============================================
# RÉSUMÉ FINAL
# ============================================

show_summary() {
    print_header "Installation terminée! ${ROCKET}"
    
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ${CHECK} Setup complet terminé avec succès! ${FIRE}               ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${CYAN}📦 Services installés:${NC}"
    echo "   ✓ Frontend (React + Vite + Tailwind)"
    echo "   ✓ Backend Laravel (API principale)"
    echo "   ✓ Backend Node.js (WebSocket)"
    echo "   ✓ Python FastAPI (Service IA)"
    echo ""
    
    echo -e "${CYAN}🚀 Pour démarrer:${NC}"
    echo ""
    echo -e "${YELLOW}Option 1 - Script automatique:${NC}"
    echo "   ./start-all.sh"
    echo ""
    echo -e "${YELLOW}Option 2 - Manuel (4 terminaux):${NC}"
    echo "   Terminal 1: cd backend/laravel && php artisan serve"
    echo "   Terminal 2: cd backend/node && npm run dev"
    echo "   Terminal 3: cd python && source venv/bin/activate && uvicorn main:app --reload --port 5000"
    echo "   Terminal 4: cd frontend && npm run dev"
    echo ""
    
    echo -e "${CYAN}📝 Prochaines étapes:${NC}"
    echo "   1. Configure tes clés API dans les fichiers .env"
    echo "   2. Crée la base de données '$DB_NAME'"
    echo "   3. Lance les migrations Laravel: cd backend/laravel && php artisan migrate"
    echo "   4. Démarre tous les services"
    echo ""
    
    echo -e "${CYAN}🌐 URLs:${NC}"
    echo "   Frontend:    http://localhost:5173"
    echo "   Laravel API: http://localhost:8000"
    echo "   Node Socket: http://localhost:3001"
    echo "   Python IA:   http://localhost:5000"
    echo ""
    
    echo -e "${GREEN}Bonne chance pour le hackathon! 🔥${NC}"
    echo ""
}

# ============================================
# MAIN
# ============================================

main() {
    clear
    
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║      ${CYAN}🚀 ACADEMIX PLATFORM - SETUP AUTOMATIQUE 🚀${PURPLE}          ║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}║      ${YELLOW}Installation complète en quelques minutes!${PURPLE}           ║${NC}"
    echo -e "${PURPLE}║                                                              ║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if ! confirm "Lancer le setup complet?"; then
        echo "Setup annulé."
        exit 0
    fi
    
    check_requirements
    create_structure
    setup_frontend
    setup_laravel
    setup_node
    setup_python
    create_global_files
    
    if confirm "Veux-tu configurer la base de données maintenant?"; then
        interactive_config
    fi
    
    show_summary
}

# Lancer le script
main
