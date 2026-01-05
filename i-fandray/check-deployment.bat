@echo off
REM Script de vérification pré-déploiement pour i-fandray (Windows)
REM Usage: check-deployment.bat

echo 🔍 Vérification de la configuration de déploiement...
echo ==================================================

REM Vérifier Node.js
echo 📦 Vérification de Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ %NODE_VERSION%

REM Vérifier npm
echo 📦 Vérification de npm...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm n'est pas installé
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION%

REM Vérifier les dépendances
echo 📦 Vérification des dépendances...
if not exist "node_modules" (
    echo ❌ node_modules manquant. Exécutez 'npm install'
    exit /b 1
)
echo ✅ Dépendances installées

REM Vérifier le fichier .env
echo 🔐 Vérification de la configuration...
if not exist ".env.local" if not exist ".env" (
    echo ❌ Fichier .env manquant. Copiez .env.example vers .env.local
    exit /b 1
)
echo ✅ Configuration présente

REM Vérifier Prisma
echo 🗄️ Vérification de Prisma...
if not exist "node_modules\.prisma" (
    echo ⚠️ Prisma client non généré. Exécution de 'npx prisma generate'...
    npx prisma generate
)
echo ✅ Prisma client généré

REM Test du build
echo 🔨 Test du build de production...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Échec du build
    exit /b 1
)
echo ✅ Build réussi

REM Vérifier le port 3000
echo 🌐 Vérification de la configuration du port...
findstr /C:"PORT=3000" package.json >nul
if %errorlevel% equ 0 (
    echo ✅ Port 3000 configuré
) else (
    echo ⚠️ Port non configuré dans package.json
)

echo.
echo 🎉 Toutes les vérifications sont passées !
echo 🚀 Votre application est prête pour le déploiement.
echo.
echo Prochaines étapes :
echo 1. Configurez vos variables d'environnement en production
echo 2. Configurez votre base de données PostgreSQL
echo 3. Déployez sur Vercel, Railway ou votre plateforme préférée
echo 4. Consultez DEPLOYMENT.md pour les instructions détaillées

pause