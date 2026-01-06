# 🔧 Configuration Google OAuth pour i-fandray

## Problème identifié
Le login Google ne fonctionne pas probablement parce que l'URL de redirection n'est pas correctement configurée dans la console Google.

## Solution

### 1. Accéder à la Console Google Cloud
1. Allez sur https://console.cloud.google.com/
2. Sélectionnez votre projet (ou créez-en un nouveau)

### 2. Configurer les identifiants OAuth
1. Dans le menu de gauche, allez dans "API et services" > "Identifiants"
2. Cliquez sur votre "ID client OAuth 2.0" existant

### 3. Ajouter l'URL de redirection correcte
Dans la section "URI de redirection autorisés", ajoutez :
```
http://localhost:3002/api/auth/callback/google
```

**Important :** Le serveur Next.js tourne actuellement sur le port 3002. Si votre serveur tourne sur un port différent, remplacez `3002` par le bon port.

### 4. Vérifier les autres paramètres
- **Origines JavaScript autorisées :** `http://localhost:3002`
- **URI de redirection autorisés :** `http://localhost:3002/api/auth/callback/google`

### 5. Tester le login
1. Redémarrez votre serveur Next.js si nécessaire
2. Allez sur http://localhost:3002/auth/login
3. Cliquez sur "Se connecter avec Google"
4. Vous devriez maintenant pouvoir vous connecter

## Debugging supplémentaire

Si ça ne marche toujours pas, vérifiez :

1. **Variables d'environnement :** Assurez-vous que `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` sont correctement définis dans `.env.local`

2. **Logs du serveur :** Ouvrez la console du navigateur (F12) et regardez l'onglet "Console" pour les erreurs

3. **Logs NextAuth :** Les logs du serveur Next.js devraient afficher des messages de debug pour le processus d'authentification

## URLs importantes
- Page de login : http://localhost:3002/auth/login
- Callback Google : http://localhost:3002/api/auth/callback/google
- Console Google : https://console.cloud.google.com/apis/credentials