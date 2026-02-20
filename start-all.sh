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
