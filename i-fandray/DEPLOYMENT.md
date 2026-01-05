# 🚀 Guide de Déploiement - i-fandray

## Prérequis

Avant de déployer, assurez-vous d'avoir :

- ✅ Node.js 18+ installé
- ✅ Base de données PostgreSQL configurée
- ✅ Variables d'environnement configurées
- ✅ Build de production réussi

## 📋 Checklist Pré-déploiement

### 1. Variables d'Environnement
Copiez `.env.example` vers `.env.local` et configurez :

```bash
cp .env.example .env.local
```

Remplissez les variables requises :
- `DATABASE_URL` : URL de votre base de données PostgreSQL
- `NEXTAUTH_SECRET` : Clé secrète pour NextAuth
- `NEXTAUTH_URL` : URL de votre domaine en production
- `OPENAI_API_KEY` : Clé API OpenAI (optionnel)
- `EMAIL_*` : Configuration SMTP pour les emails

### 2. Base de Données
```bash
# Appliquer les migrations Prisma
npx prisma migrate deploy

# (Optionnel) Peupler la base avec des données de test
npx prisma db seed
```

### 3. Build de Production
```bash
# Installer les dépendances
npm ci

# Générer le client Prisma
npx prisma generate

# Build de production
npm run build
```

## 🌐 Plateformes de Déploiement

### Option 1: Vercel (Recommandé pour Next.js)

1. **Connectez votre repo GitHub à Vercel**
2. **Variables d'environnement** :
   - Allez dans Project Settings > Environment Variables
   - Ajoutez toutes les variables de `.env.local`

3. **Configuration du build** :
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm ci`

4. **Base de données** :
   - Utilisez une base PostgreSQL hébergée (Neon, Supabase, Railway)
   - Mettez à jour `DATABASE_URL` avec l'URL de production

### Option 2: Railway

1. **Créez un nouveau projet**
2. **Ajoutez PostgreSQL** :
   - Railway > Add > Database > PostgreSQL
   - Copiez l'URL de connexion

3. **Déployez l'app** :
   ```bash
   railway login
   railway link
   railway add --name ifandray
   railway variables set DATABASE_URL=your_postgres_url
   railway variables set NEXTAUTH_SECRET=your_secret
   railway variables set NEXTAUTH_URL=https://your-app.railway.app
   railway up
   ```

### Option 3: DigitalOcean App Platform

1. **Créez une app**
2. **Configurez la source** : GitHub
3. **Variables d'environnement** : Ajoutez toutes les variables
4. **Base de données** : Utilisez DigitalOcean Managed Database

## 🔧 Configuration Post-déploiement

### 1. OAuth Providers
Configurez les URLs de redirection dans :
- **Google Console** : `https://yourdomain.com/api/auth/callback/google`
- **Facebook Developers** : `https://yourdomain.com/api/auth/callback/facebook`
- **GitHub** : `https://yourdomain.com/api/auth/callback/github`

### 2. Domaines Personnalisés
- Mettez à jour `NEXTAUTH_URL` avec votre domaine
- Configurez les DNS si nécessaire

### 3. SSL/TLS
- Automatique sur Vercel/Railway
- Configurez Let's Encrypt sur d'autres plateformes

## 📊 Monitoring et Maintenance

### Logs
```bash
# Vercel
vercel logs

# Railway
railway logs

# PM2 (si auto-hébergé)
pm2 logs
```

### Base de Données
```bash
# Migrations
npx prisma migrate deploy

# Studio Prisma
npx prisma studio
```

### Performance
- Utilisez Vercel Analytics ou un service similaire
- Monitorer les erreurs avec Sentry ou LogRocket

## 🐛 Dépannage

### Erreurs Courantes

1. **Build échoue** :
   - Vérifiez les variables d'environnement
   - Assurez-vous que `npm ci` fonctionne

2. **Base de données inaccessible** :
   - Vérifiez `DATABASE_URL`
   - Assurez-vous que la DB accepte les connexions externes

3. **OAuth ne fonctionne pas** :
   - Vérifiez les URLs de redirection
   - Assurez-vous que l'app est en mode "Production"

4. **Images ne se chargent pas** :
   - Configurez `NEXT_PUBLIC_BASE_URL`
   - Vérifiez les permissions des dossiers

## 🔒 Sécurité

- ✅ Changez tous les mots de passe par défaut
- ✅ Utilisez HTTPS en production
- ✅ Configurez CORS si nécessaire
- ✅ Activez la protection CSRF
- ✅ Mettez à jour régulièrement les dépendances

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de déploiement
2. Consultez la documentation Next.js
3. Ouvrez une issue sur GitHub

---

🎉 **Votre app i-fandray est maintenant déployée !**