#!/bin/bash

# Script de vérification pré-déploiement pour i-fandray
# Usage: ./check-deployment.sh

echo "🔍 Vérification de la configuration de déploiement..."
echo "=================================================="

# Vérifier Node.js
echo "📦 Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION"

# Vérifier npm
echo "📦 Vérification de npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✅ npm $NPM_VERSION"

# Vérifier les dépendances
echo "📦 Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules manquant. Exécutez 'npm install'"
    exit 1
fi
echo "✅ Dépendances installées"

# Vérifier le fichier .env
echo "🔐 Vérification de la configuration..."
if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant. Copiez .env.example vers .env.local"
    exit 1
fi
echo "✅ Configuration présente"

# Vérifier Prisma
echo "🗄️ Vérification de Prisma..."
if ! command -v npx &> /dev/null; then
    echo "❌ npx n'est pas disponible"
    exit 1
fi

if [ ! -d "node_modules/.prisma" ]; then
    echo "⚠️ Prisma client non généré. Exécution de 'npx prisma generate'..."
    npx prisma generate
fi
echo "✅ Prisma client généré"

# Test du build
echo "🔨 Test du build de production..."
if npm run build; then
    echo "✅ Build réussi"
else
    echo "❌ Échec du build"
    exit 1
fi

# Vérifier le port 3000
echo "🌐 Vérification de la configuration du port..."
if grep -q "PORT=3000" package.json; then
    echo "✅ Port 3000 configuré"
else
    echo "⚠️ Port non configuré dans package.json"
fi

echo ""
echo "🎉 Toutes les vérifications sont passées !"
echo "🚀 Votre application est prête pour le déploiement."
echo ""
echo "Prochaines étapes :"
echo "1. Configurez vos variables d'environnement en production"
echo "2. Configurez votre base de données PostgreSQL"
echo "3. Déployez sur Vercel, Railway ou votre plateforme préférée"
echo "4. Consultez DEPLOYMENT.md pour les instructions détaillées"