#!/bin/bash

# Script de vérification de sécurité pour i-fandray
# Usage: ./security-check.sh

echo "🔒 Vérification de sécurité pré-déploiement..."
echo "============================================="

ERRORS=0
WARNINGS=0

# Fonction pour afficher les erreurs
error() {
    echo "❌ $1"
    ((ERRORS++))
}

# Fonction pour afficher les avertissements
warning() {
    echo "⚠️  $1"
    ((WARNINGS++))
}

# Fonction pour afficher le succès
success() {
    echo "✅ $1"
}

# 1. Vérifier les fichiers sensibles
echo "📁 Vérification des fichiers sensibles..."

if [ -f ".env" ]; then
    error "Fichier .env trouvé ! Ce fichier ne doit jamais être commité."
fi

if [ -f ".env.local" ]; then
    success "Fichier .env.local présent"
else
    warning "Fichier .env.local manquant. Copiez .env.example vers .env.local"
fi

# Vérifier les clés privées
if find . -name "*.key" -o -name "*.pem" -o -name "*.p12" -o -name "*.pfx" -o -name "id_rsa" -o -name "id_dsa" | grep -v node_modules | grep -v .git; then
    error "Fichiers de clés privées trouvés dans le projet !"
fi

# Vérifier les mots de passe en dur
if grep -r "password\|secret\|key\|token" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v node_modules | grep -v .git | grep -v "process.env" | grep -v "import\|export\|const\|let\|var"; then
    error "Mots de passe ou clés API en dur trouvés dans le code !"
fi

# 2. Vérifier la configuration Next.js
echo "⚙️  Vérification de la configuration Next.js..."

if [ -f "next.config.js" ]; then
    success "next.config.js présent"

    # Vérifier les headers de sécurité
    if grep -q "X-Frame-Options\|X-Content-Type-Options\|Content-Security-Policy" next.config.js; then
        success "Headers de sécurité configurés dans next.config.js"
    else
        warning "Headers de sécurité manquants dans next.config.js"
    fi
else
    error "next.config.js manquant"
fi

# 3. Vérifier le middleware
echo "🛡️  Vérification du middleware de sécurité..."

if [ -f "middleware.ts" ]; then
    success "Middleware présent"

    # Vérifier les protections
    if grep -q "rate.*limit\|Rate.*Limit" middleware.ts; then
        success "Rate limiting configuré"
    else
        warning "Rate limiting manquant dans le middleware"
    fi

    if grep -q "X-Frame-Options\|X-Content-Type-Options\|Content-Security-Policy" middleware.ts; then
        success "Headers de sécurité présents dans le middleware"
    else
        warning "Headers de sécurité manquants dans le middleware"
    fi
else
    error "Middleware manquant"
fi

# 4. Vérifier ESLint
echo "🔍 Vérification d'ESLint..."

if [ -f ".eslintrc.json" ]; then
    success "Configuration ESLint présente"

    # Vérifier les règles de sécurité
    if grep -q "no-eval\|no-implied-eval\|no-script-url" .eslintrc.json; then
        success "Règles de sécurité ESLint configurées"
    else
        warning "Règles de sécurité manquantes dans ESLint"
    fi
else
    warning "Configuration ESLint manquante"
fi

# 5. Vérifier les dépendances
echo "📦 Vérification des dépendances..."

if [ -f "package.json" ]; then
    # Vérifier les dépendances vulnérables
    if command -v npm &> /dev/null; then
        echo "Vérification des vulnérabilités (cela peut prendre du temps)..."
        if npm audit --audit-level moderate 2>/dev/null | grep -q "vulnerabilities"; then
            VULN_COUNT=$(npm audit --audit-level moderate 2>/dev/null | grep "vulnerabilities" | head -1 | grep -o "[0-9]*")
            if [ "$VULN_COUNT" -gt 0 ]; then
                warning "$VULN_COUNT vulnérabilités trouvées. Exécutez 'npm audit fix'"
            fi
        else
            success "Aucune vulnérabilité critique trouvée"
        fi
    fi
fi

# 6. Vérifier les permissions des fichiers
echo "🔐 Vérification des permissions..."

# Vérifier que les scripts ne sont pas exécutables inutilement
if [ -x ".env.example" ]; then
    warning "Fichier .env.example exécutable - correction automatique"
    chmod -x .env.example
fi

# 7. Vérifier la configuration Git
echo "📊 Vérification de Git..."

if [ -f ".gitignore" ]; then
    success ".gitignore présent"

    # Vérifier que les fichiers sensibles sont ignorés
    if grep -q "\.env" .gitignore; then
        success "Fichiers .env ignorés par Git"
    else
        error "Fichiers .env non ignorés par Git !"
    fi
else
    error ".gitignore manquant"
fi

# 8. Vérifier les secrets dans Git
echo "🔍 Vérification des secrets dans Git..."

if command -v git &> /dev/null && [ -d ".git" ]; then
    # Vérifier les commits pour des secrets
    if git log --all --grep="password\|secret\|key\|token" | grep -q "password\|secret\|key\|token"; then
        warning "Commits contenant potentiellement des secrets trouvés"
    fi

    # Vérifier les fichiers trackés sensibles
    TRACKED_SENSITIVE=$(git ls-files | grep -E "\.(key|pem|p12|pfx|env)$" || true)
    if [ -n "$TRACKED_SENSITIVE" ]; then
        error "Fichiers sensibles trackés par Git: $TRACKED_SENSITIVE"
    fi
fi

# 9. Résumé
echo ""
echo "📊 RÉSULTATS DE LA VÉRIFICATION DE SÉCURITÉ"
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
    echo "✅ Aucune erreur critique trouvée"
else
    echo "❌ $ERRORS erreur(s) critique(s) trouvée(s)"
fi

if [ $WARNINGS -eq 0 ]; then
    echo "✅ Aucun avertissement"
else
    echo "⚠️  $WARNINGS avertissement(s)"
fi

echo ""

if [ $ERRORS -eq 0 ]; then
    echo "🎉 Votre projet est prêt pour le déploiement sécurisé !"
    exit 0
else
    echo "🚫 Corrigez les erreurs avant de déployer !"
    exit 1
fi