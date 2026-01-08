# 🔒 Guide de Sécurité - i-fandray

## Vue d'ensemble

Ce document décrit les mesures de sécurité implémentées dans i-fandray pour protéger votre application et vos utilisateurs.

## 🛡️ Mesures de Sécurité Implémentées

### 1. **Middleware de Sécurité**

Le middleware (`middleware.ts`) fournit plusieurs couches de protection :

- **Rate Limiting** : Limite les requêtes à 100 par fenêtre de 15 minutes par IP
- **Détection d'attaques** : Bloque les IPs et User-Agents suspects
- **Protection XSS** : Détecte les patterns d'injection XSS dans les paramètres
- **Headers de sécurité** : CSP, X-Frame-Options, HSTS, etc.

### 2. **Configuration Next.js Sécurisée**

- **Headers de sécurité** automatiques sur toutes les routes
- **Images sécurisées** : Désactivation des SVG externes non sécurisés
- **Build optimisé** : Source maps désactivés en production
- **TypeScript strict** : Vérifications de types renforcées

### 3. **Authentification Sécurisée**

- **NextAuth.js** avec adaptateur Prisma
- **OAuth sécurisé** pour Google, Facebook
- **Sessions JWT** avec secrets forts
- **Protection CSRF** intégrée

### 4. **Base de Données Sécurisée**

- **Prisma ORM** avec requêtes paramétrées
- **Validation Zod** pour toutes les entrées
- **Transactions** pour l'intégrité des données
- **Indexes optimisés** pour les performances

### 5. **Gestion des Secrets**

- **Variables d'environnement** chiffrées
- **.gitignore renforcé** pour exclure tous les fichiers sensibles
- **Clés de chiffrement** pour les données sensibles
- **Audit automatique** des secrets dans le code

## 🔧 Vérifications de Sécurité

### Scripts Automatisés

```bash
# Vérification complète de sécurité (Linux/Mac)
npm run security-check

# Vérification complète de sécurité (Windows)
npm run security-check:win
```

### Ce qui est vérifié :

- ✅ **Fichiers sensibles** non committés
- ✅ **Clés privées** absentes du projet
- ✅ **Mots de passe en dur** dans le code
- ✅ **Headers de sécurité** configurés
- ✅ **Middleware actif**
- ✅ **Règles ESLint** de sécurité
- ✅ **Vulnérabilités** des dépendances
- ✅ **Permissions** des fichiers
- ✅ **Configuration Git** sécurisée

## 🚨 Alertes de Sécurité

### Erreurs Critiques (Bloquent le déploiement)

- Fichier `.env` commité
- Clés privées dans le repository
- Mots de passe en dur dans le code
- Headers de sécurité manquants
- Middleware de sécurité absent

### Avertissements (À corriger)

- Vulnérabilités dans les dépendances
- Règles ESLint manquantes
- Permissions de fichiers incorrectes

## 🔐 Bonnes Pratiques de Sécurité

### 1. **Gestion des Secrets**

```bash
# Copiez toujours depuis l'exemple
cp .env.example .env.local

# Remplissez avec vos vraies valeurs
# NE JAMAIS commiter .env.local
```

### 2. **Mises à jour de sécurité**

```bash
# Vérifiez régulièrement les vulnérabilités
npm audit

# Mettez à jour les dépendances
npm update

# Auditez et corrigez
npm audit fix
```

### 3. **Configuration OAuth**

- **Google** : Configurez les origines autorisées
- **Facebook** : Utilisez `https` en production

### 4. **Base de Données**

- Utilisez des mots de passe forts
- Activez SSL/TLS pour les connexions
- Limitez les accès IP
- Sauvegardez régulièrement

## 📊 Monitoring et Logs

### En Production

- **Sentry** pour le monitoring d'erreurs
- **Logs structurés** avec niveaux appropriés
- **Alertes automatiques** sur les anomalies
- **Audit trails** pour les actions sensibles

### Variables de Monitoring

```env
# Sentry pour les erreurs
SENTRY_DSN="votre-sentry-dsn"

# Niveau de log
LOG_LEVEL="info"
```

## 🚫 Éléments Non Déployables

### Fichiers à Exclure Absolument

- `.env*` (sauf `.env.example`)
- `*.key`, `*.pem`, `*.crt`
- `*.db`, `*.sqlite*`
- `id_rsa`, `id_dsa`
- `secrets.json`, `credentials.json`
- Tous les fichiers de clés privées

### Données Sensibles

- Mots de passe utilisateur
- Clés API privées
- Tokens d'accès
- Informations de carte bancaire
- Données médicales

## 🔧 Dépannage Sécurité

### Problèmes Courants

1. **Build échoue à cause des règles ESLint**
   ```bash
   # Désactiver temporairement pour déboguer
   ESLINT_NO_DEV_ERRORS=true npm run build
   ```

2. **Rate limiting trop restrictif**
   ```bash
   # Ajuster dans middleware.ts
   const RATE_LIMIT = 200; // Augmenter la limite
   ```

3. **CSP bloque des ressources légitimes**
   ```bash
   # Ajuster les règles CSP dans middleware.ts
   "script-src 'self' 'unsafe-inline' https://trusted-domain.com"
   ```

## 📞 Support Sécurité

### Signaler une Vulnérabilité

Si vous découvrez une vulnérabilité :

1. **NE PAS** créer d'issue publique
2. Contactez directement les mainteneurs
3. Fournissez les détails de reproduction
4. Attendez la correction avant divulgation

### Mises à Jour de Sécurité

- Suivez les releases pour les correctifs
- Abonnez-vous aux notifications GitHub
- Vérifiez régulièrement les advisories de sécurité

## ✅ Checklist Pré-déploiement

- [ ] `npm run security-check` passe sans erreur
- [ ] Toutes les variables d'environnement configurées
- [ ] Clés OAuth configurées pour le domaine de production
- [ ] Base de données PostgreSQL sécurisée
- [ ] Certificats SSL valides
- [ ] Headers de sécurité actifs
- [ ] Rate limiting configuré
- [ ] Logs de sécurité activés

---

**🔒 La sécurité est une responsabilité partagée. Merci de contribuer à maintenir i-fandray sécurisé !**