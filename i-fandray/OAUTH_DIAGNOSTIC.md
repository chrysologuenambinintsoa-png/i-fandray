# 🔧 Diagnostic complet OAuth Google & Facebook

## 🚨 Problèmes identifiés

### 1. **Mapping des champs Prisma incorrect**
- ❌ Facebook utilisait le profile par défaut qui retournait `name` et `image`
- ❌ Ces champs n'existent pas dans le schéma Prisma (`firstName`/`lastName`, `avatar`)

### 2. **URLs de redirection potentiellement incorrectes**
- Google/Facebook peuvent refuser si les URLs ne correspondent pas exactement

## ✅ Corrections appliquées

### **Profile Callbacks corrigés**
```typescript
// Google
profile(profile) {
  return {
    id: profile.sub,
    email: profile.email,
    avatar: profile.picture, // ✅ image → avatar
    firstName: firstName,
    lastName: lastName,
    username: baseUsername,
  };
}

// Facebook
profile(profile) {
  return {
    id: profile.id,
    email: profile.email,
    avatar: profile.picture?.data?.url || profile.picture, // ✅ Gestion structure Facebook
    firstName: firstName,
    lastName: lastName,
    username: baseUsername,
  };
}
```

## 🔍 Vérifications à faire dans les consoles

### **Google Cloud Console**
1. Allez sur https://console.cloud.google.com/apis/credentials
2. Sélectionnez votre "ID client OAuth 2.0"
3. **Origines JavaScript autorisées** :
   - ✅ `http://localhost:3000`
4. **URI de redirection autorisés** :
   - ✅ `http://localhost:3000/api/auth/callback/google`

### **Facebook Developers**
1. Allez sur https://developers.facebook.com/apps/
2. Sélectionnez votre app
3. **Paramètres > Authentification Facebook** :
   - ✅ URI de redirection OAuth valides : `http://localhost:3000/api/auth/callback/facebook`
4. **Paramètres > De base** :
   - ✅ App Domains : `localhost`
   - ✅ Privacy Policy URL : (optionnel pour dev)
   - ✅ Terms of Service URL : (optionnel pour dev)

## 🧪 Tests à effectuer

### **Test Google OAuth**
```bash
# 1. Ouvrir http://localhost:3000/auth/login
# 2. Cliquer "Se connecter avec Google"
# 3. Vérifier que Google ouvre la page de connexion
# 4. Après authentification, vérifier redirection vers /feed
```

### **Test Facebook OAuth**
```bash
# 1. Ouvrir http://localhost:3000/auth/login
# 2. Cliquer "Se connecter avec Facebook"
# 3. Vérifier que Facebook ouvre la page de connexion
# 4. Après authentification, vérifier redirection vers /feed
```

## 🔧 Commandes de diagnostic

```bash
# Vérifier les credentials
node test-google-oauth.js

# Vérifier la base de données
npx prisma studio

# Logs du serveur (dans un autre terminal)
npm run dev
```

## 🚨 Si les problèmes persistent

### **Problème : "Google refuse d'ouvrir"**
- ❌ Vérifier que l'URL de redirection dans Google Cloud Console est exactement : `http://localhost:3000/api/auth/callback/google`
- ❌ Vérifier que l'origine `http://localhost:3000` est autorisée

### **Problème : "Redirection Facebook bloquée"**
- ❌ Vérifier que l'URI de redirection dans Facebook Developers est exactement : `http://localhost:3000/api/auth/callback/facebook`
- ❌ Vérifier que l'app Facebook est en mode "Development" (pas "Live")

### **Problème : Erreur Prisma après OAuth**
- ❌ Les profile callbacks ont été corrigés, mais vérifier les logs pour d'autres erreurs

## 📋 Checklist finale

- [ ] Serveur Next.js sur port 3000 ✅
- [ ] Profile callbacks corrigés ✅
- [ ] URLs Google Cloud Console vérifiées
- [ ] URLs Facebook Developers vérifiées
- [ ] Test Google OAuth réussi
- [ ] Test Facebook OAuth réussi

## 🎯 Prochaines étapes

1. **Vérifier les URLs dans les consoles Google/Facebook**
2. **Tester les logins OAuth**
3. **Vérifier les logs du serveur pour les erreurs**
4. **Si ça ne marche pas, partager les erreurs spécifiques**