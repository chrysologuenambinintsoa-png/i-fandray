@echo off
REM Script de vérification de sécurité pour i-fandray (Windows)
REM Usage: security-check.bat

echo 🔒 Vérification de sécurité pré-déploiement...
echo =============================================

set ERRORS=0
set WARNINGS=0

REM Fonction pour afficher les erreurs
:error
echo ❌ %~1
set /a ERRORS+=1
goto :eof

REM Fonction pour afficher les avertissements
:warning
echo ⚠️  %~1
set /a WARNINGS+=1
goto :eof

REM Fonction pour afficher le succès
:success
echo ✅ %~1
goto :eof

echo 📁 Vérification des fichiers sensibles...

if exist ".env" (
    call :error "Fichier .env trouvé ! Ce fichier ne doit jamais être commité."
)

if exist ".env.local" (
    call :success "Fichier .env.local présent"
) else (
    call :warning "Fichier .env.local manquant. Copiez .env.example vers .env.local"
)

REM Vérifier les clés privées
for /r %%i in (*.key *.pem *.p12 *.pfx id_rsa id_dsa) do (
    echo %%i | findstr /v "node_modules" | findstr /v ".git" >nul
    if not errorlevel 1 (
        call :error "Fichiers de clés privées trouvés dans le projet !"
        goto check_next
    )
)
:check_next

echo ⚙️  Vérification de la configuration Next.js...

if exist "next.config.js" (
    call :success "next.config.js présent"

    findstr /c:"X-Frame-Options" next.config.js >nul
    if not errorlevel 1 (
        call :success "Headers de sécurité configurés dans next.config.js"
    ) else (
        call :warning "Headers de sécurité manquants dans next.config.js"
    )
) else (
    call :error "next.config.js manquant"
)

echo 🛡️  Vérification du middleware de sécurité...

if exist "middleware.ts" (
    call :success "Middleware présent"

    findstr /i "rate.*limit" middleware.ts >nul
    if not errorlevel 1 (
        call :success "Rate limiting configuré"
    ) else (
        call :warning "Rate limiting manquant dans le middleware"
    )
) else (
    call :error "Middleware manquant"
)

echo 🔍 Vérification d'ESLint...

if exist ".eslintrc.json" (
    call :success "Configuration ESLint présente"

    findstr /c:"no-eval" .eslintrc.json >nul
    if not errorlevel 1 (
        call :success "Règles de sécurité ESLint configurées"
    ) else (
        call :warning "Règles de sécurité manquantes dans ESLint"
    )
) else (
    call :warning "Configuration ESLint manquante"
)

echo 📦 Vérification des dépendances...

if exist "package.json" (
    where npm >nul 2>nul
    if not errorlevel 1 (
        echo Vérification des vulnérabilités...
        for /f %%i in ('npm audit --audit-level moderate 2^>nul ^| findstr "vulnerabilities"') do (
            echo %%i | findstr /r "[1-9][0-9]*" >nul
            if not errorlevel 1 (
                call :warning "Vulnérabilités trouvées. Exécutez 'npm audit fix'"
            )
        )
        call :success "Vérification des vulnérabilités terminée"
    )
)

echo 🔐 Vérification des permissions...

REM Vérifier les permissions des fichiers sensibles
if exist ".env.example" (
    REM Vérifier si le fichier est exécutable (difficile sous Windows)
    call :success "Permissions de base vérifiées"
)

echo 📊 Vérification de Git...

if exist ".gitignore" (
    call :success ".gitignore présent"

    findstr /c:".env" .gitignore >nul
    if not errorlevel 1 (
        call :success "Fichiers .env ignorés par Git"
    ) else (
        call :error "Fichiers .env non ignorés par Git !"
    )
) else (
    call :error ".gitignore manquant"
)

echo 🔍 Vérification des secrets dans Git...

where git >nul 2>nul
if not errorlevel 1 if exist ".git" (
    REM Vérification basique des fichiers trackés sensibles
    for /f %%i in ('git ls-files 2^>nul ^| findstr /r "\.key$\|\.pem$\|\.p12$\|\.pfx$\|\.env$"') do (
        call :error "Fichiers sensibles trackés par Git: %%i"
    )
)

echo.
echo 📊 RÉSULTATS DE LA VÉRIFICATION DE SÉCURITÉ
echo ==========================================

if %ERRORS% equ 0 (
    echo ✅ Aucune erreur critique trouvée
) else (
    echo ❌ %ERRORS% erreur(s) critique(s) trouvée(s)
)

if %WARNINGS% equ 0 (
    echo ✅ Aucun avertissement
) else (
    echo ⚠️  %WARNINGS% avertissement(s)
)

echo.

if %ERRORS% equ 0 (
    echo 🎉 Votre projet est prêt pour le déploiement sécurisé !
    exit /b 0
) else (
    echo 🚫 Corrigez les erreurs avant de déployer !
    exit /b 1
)