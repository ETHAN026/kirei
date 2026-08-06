#!/bin/bash

echo "🔍 Diagnostic Kirei frontend API"
echo "================================"

# Vérifier qu'on est dans le frontend
if [ ! -d "src/api" ]; then
  echo "❌ Lance ce script depuis kirei-frontend"
  exit 1
fi

echo ""
echo "1) Vérification des fichiers API..."
echo ""

grep -R "api.get('/admin\|api.post('/admin\|api.put('/admin\|api.delete('/admin" src/api && {
    echo "⚠️ Routes admin sans /api détectées"
} || {
    echo "✅ Routes admin OK"
}


echo ""
echo "2) Correction automatique des routes admin..."
echo ""

sed -i "s|'\/admin|'\/api/admin|g" src/api/*.js

echo "✅ Routes admin corrigées"


echo ""
echo "3) Vérification auth/me..."
echo ""

grep -R "'/auth/me'" src/api && {
    echo "⚠️ Correction auth/me"
    sed -i "s|'\/auth/me|'\/api/auth/me|g" src/api/*.js
} || {
    echo "✅ auth/me OK"
}


echo ""
echo "4) Vérification client axios..."
echo ""

if grep -q "localStorage.getItem(\"token\")" src/api/client.js; then
    echo "✅ Token récupéré depuis localStorage"
else
    echo "⚠️ Token non trouvé dans client.js"
fi


echo ""
echo "5) Recherche sauvegarde token après login..."
echo ""

grep -R "localStorage.setItem.*token" src || {
    echo "❌ Aucun stockage de token trouvé"
    echo "Ajoute après login :"
    echo ""
    echo 'localStorage.setItem("token", data.token)'
}


echo ""
echo "6) Recherche URL backend..."
echo ""

grep -R "VITE_API_URL" .env* src 2>/dev/null

echo ""
echo "================================"
echo "✅ Diagnostic terminé"
echo ""
echo "N'oublie pas :"
echo "git add ."
echo "git commit -m 'fix api routes'"
echo "git push"
