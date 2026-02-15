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
uvicorn main:app --reload --port 8001
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
- Python IA: http://localhost:8001

## 👥 Équipe

- Hanna BIAOU - Frontend (React)
- Mourchid FOLARIN - Backend (Laravel)
- Octave BAHOUN-HOUTOUKPE - Backend (Node.js + Python IA)

---

Projet Hackathon 2 semaines 🔥
