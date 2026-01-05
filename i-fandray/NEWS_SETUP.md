# News System Setup Guide

## Configuration des Actualités Réelles

Ce système permet de récupérer et afficher de vraies actualités depuis NewsAPI.org.

### 1. Obtenir une clé API NewsAPI

1. Allez sur [NewsAPI.org](https://newsapi.org)
2. Créez un compte gratuit
3. Copiez votre clé API
4. Ajoutez-la dans votre fichier `.env.local` :

```env
NEWS_API_KEY=votre-cle-api-ici
```

### 2. Synchronisation des Actualités

#### Synchronisation Manuelle

Utilisez le bouton "Sync" dans l'interface des actualités ou exécutez :

```bash
npm run sync-news
```

#### Synchronisation Automatique

Pour une synchronisation automatique, vous pouvez :

1. **Ajouter une tâche cron** (Linux/Mac) :
```bash
# Synchroniser toutes les heures
0 * * * * cd /chemin/vers/votre/projet && npm run sync-news
```

2. **Utiliser un service comme GitHub Actions** pour une synchronisation périodique

### 3. Fonctionnalités

#### ✅ Actualités Réelles
- Récupération automatique depuis NewsAPI
- Catégories : Business, Technology, Sports, Entertainment, Science
- Images et descriptions complètes
- Sources fiables (BBC, CNN, Reuters, etc.)

#### ✅ Gestion Automatique
- Suppression automatique des anciennes actualités (30 jours)
- Évite les doublons
- Marquage automatique des articles tendance

#### ✅ Interface Utilisateur
- Filtrage par catégories
- Pagination infinie
- États de chargement
- Gestion d'erreurs

### 4. Structure de la Base de Données

Le modèle `News` inclut :
- `title`: Titre de l'article
- `content`: Contenu complet
- `summary`: Résumé court
- `imageUrl`: URL de l'image
- `source`: Source de l'article
- `category`: Catégorie (business, technology, etc.)
- `url`: Lien vers l'article original
- `publishedAt`: Date de publication
- `authorId`: Auteur système

### 5. API Routes

#### GET `/api/news`
Récupère les actualités avec filtrage et pagination.

Paramètres :
- `category`: Filtrer par catégorie
- `limit`: Nombre d'articles (défaut: 20)
- `offset`: Offset pour pagination

#### POST `/api/news/sync`
Déclenche une synchronisation des actualités.

Paramètres :
- `category`: Catégorie à synchroniser (optionnel)

### 6. Personnalisation

#### Ajouter de Nouvelles Sources
Modifiez `lib/newsService.ts` pour ajouter d'autres APIs d'actualités.

#### Modifier les Catégories
Ajoutez ou modifiez les catégories dans :
- `components/NewsAggregator.tsx`
- `lib/newsService.ts`

#### Fréquence de Synchronisation
Ajustez la fréquence selon vos besoins :
- Toutes les heures pour l'actualité
- Toutes les 6 heures pour les articles moins urgents

### 7. Limitations NewsAPI (Plan Gratuit)

- 100 requêtes par jour
- 1 mois d'historique
- Articles en anglais uniquement
- Pas d'articles payants

Pour plus de fonctionnalités, considérez un plan payant ou d'autres APIs.

### 8. Dépannage

#### Problème : "NEWS_API_KEY not found"
- Vérifiez que la variable est dans `.env.local`
- Redémarrez le serveur de développement

#### Problème : Pas d'actualités affichées
- Vérifiez la clé API
- Exécutez `npm run sync-news`
- Vérifiez les logs du serveur

#### Problème : Actualités anciennes
- Les actualités sont automatiquement nettoyées après 30 jours
- Réduisez ce délai dans `lib/newsService.ts` si nécessaire

### 9. Sécurité

- La clé API est stockée côté serveur uniquement
- Les utilisateurs ne peuvent pas accéder directement à l'API externe
- Validation des données avant insertion en base