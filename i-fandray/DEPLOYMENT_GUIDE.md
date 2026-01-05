# 🚀 Guide de Déploiement - i-fandray

## Prérequis
- Node.js 18+
- Base de données PostgreSQL (cloud ou local)
- Compte GitHub
- Compte Netlify

## Configuration de la Base de Données
1. Créez une base de données PostgreSQL (recommandé : [Supabase](https://supabase.com), [Neon](https://neon.tech), ou [ElephantSQL](https://www.elephantsql.com))
2. Obtenez votre URL de connexion à la base de données

## Variables d'Environnement
1. Copiez `.env.example` vers `.env`
2. Remplissez avec vos vraies valeurs :
   - `DATABASE_URL` : Votre chaîne de connexion PostgreSQL
   - `NEXTAUTH_SECRET` : Générez une chaîne aléatoire sécurisée
   - `NEXTAUTH_URL` : L'URL de votre site Netlify (après déploiement)
   - Clés API pour OpenAI, Twilio, etc.

## Configuration GitHub
1. Créez un nouveau dépôt sur GitHub
2. Poussez votre code :
   ```bash
   git add .
   git commit -m "Commit initial"
   git branch -M main
   git remote add origin https://github.com/votreusername/votre-repo.git
   git push -u origin main
   ```

## Déploiement Netlify
1. Allez sur [Netlify](https://netlify.com) et connectez-vous
2. Cliquez sur "New site from Git"
3. Connectez votre dépôt GitHub
4. Configurez les paramètres de build :
   - **Commande de build** : `npm run build`
   - **Répertoire de publication** : `.next` (laisser par défaut)
5. Ajoutez les variables d'environnement dans le tableau de bord Netlify (Paramètres du site > Variables d'environnement)
6. Cliquez sur "Deploy site"

## Après le Déploiement
1. Mettez à jour `NEXTAUTH_URL` dans les variables d'environnement Netlify avec l'URL de votre site
2. Exécutez les migrations de base de données si nécessaire (Prisma les gère lors du build)
3. Testez toutes les fonctionnalités
4. Configurez un domaine personnalisé (optionnel)

## Notes de Production
- La base de données est maintenant PostgreSQL pour la persistance
- Les routes API deviennent des fonctions Netlify
- Les actifs statiques sont servis via CDN
- Les fonctionnalités en temps réel fonctionnent avec WebSockets

## Fonctionnalités Ajoutées pour la Production
- **Système de signalement** : Les utilisateurs peuvent signaler des posts, commentaires ou utilisateurs inappropriés
- **Limitation du taux** : Protection contre les abus avec limitation des requêtes API
- **Sécurité renforcée** : Middleware pour la validation et la protection

## Sécurité
- Toutes les données fictives ont été supprimées
- Authentification sécurisée avec NextAuth
- Validation des entrées utilisateur
- Chiffrement des mots de passe
- Protection CSRF et XSS

Bonne chance avec votre déploiement ! 🎉