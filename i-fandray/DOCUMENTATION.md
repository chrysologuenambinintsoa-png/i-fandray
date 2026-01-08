# i-Fandray - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Components](#components)
6. [Features](#features)
7. [Multilingual Support](#multilingual-support)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

## Project Overview

i-Fandray is a modern social media application built with Next.js 14, React, PostgreSQL, and Prisma. It features real-time messaging, posts, stories, notifications, groups, live streaming, and AI-powered features.

### Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Authentication**: NextAuth.js
- **AI**: OpenAI API

## Architecture

### Project Structure
```
ifandray/
├── prisma/                  # Database schema and migrations
│   └── schema.prisma
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── auth/          # Authentication pages
│   │   ├── feed/          # Main feed
│   │   ├── profile/       # User profiles
│   │   ├── settings/      # Settings pages
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page (splash screen)
│   ├── components/        # React components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── PostCard.tsx
│   │   ├── CreatePost.tsx
│   │   ├── StoryTray.tsx
│   │   └── Splashscreen.tsx
│   ├── config/            # Configuration files
│   │   └── locales/       # Language files
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSettings.ts
│   │   └── useNotifications.ts
│   ├── lib/               # Utility functions
│   │   ├── prisma.ts
│   │   ├── i18n.ts
│   │   └── utils.ts
│   ├── styles/            # Global styles
│   │   └── globals.css
│   └── types/             # TypeScript types
│       └── index.ts
├── public/                # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### Design Patterns
- **Component-based architecture**: Reusable UI components
- **State management**: Zustand for global state
- **Type safety**: Full TypeScript coverage
- **API routes**: Serverless functions for backend logic
- **Real-time updates**: WebSocket integration

## Database Schema

### User Model
```typescript
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  mobile        String?   @unique
  password      String
  firstName     String
  lastName      String
  username      String    @unique
  avatar        String?
  coverPhoto    String?
  bio           String?
  location      String?
  website       String?
  isVerified    Boolean   @default(false)
  isActive      Boolean   @default(true)
  language      String    @default("en")
  theme         String    @default("light")
  // ... relations
}
```

### Key Models
- **Post**: User posts with media support
- **Comment**: Nested comments on posts
- **Like**: User likes on posts
- **Share**: Post sharing
- **Message**: Real-time messages
- **Notification**: User notifications
- **Story**: Ephemeral stories
- **Group**: User groups
- **LiveStream**: Live broadcasts
- **News**: News articles

## API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
```

### Posts
```
GET  /api/posts              # Get posts feed
POST /api/posts              # Create post
PUT  /api/posts/[id]         # Update post
DELETE /api/posts/[id]       # Delete post
GET  /api/posts/[id]/comments # Get post comments
POST /api/posts/[id]/comments # Add comment
```

### Users
```
GET  /api/users              # Get users
GET  /api/users/[id]         # Get user profile
PUT  /api/users/[id]         # Update profile
GET  /api/users/[id]/posts   # Get user posts
```

### Messages
```
GET  /api/messages           # Get conversations
POST /api/messages           # Send message
GET  /api/messages/[id]      # Get conversation messages
```

### Notifications
```
GET  /api/notifications      # Get notifications
PUT  /api/notifications/[id]/read # Mark as read
```

### Stories
```
GET  /api/stories            # Get stories
POST /api/stories            # Create story
GET  /api/stories/[id]       # Get story details
```

## Components

### Header
Main navigation header with:
- Logo and search bar
- Navigation icons (Home, Create, Messages, Notifications)
- User profile dropdown
- Responsive design

### Sidebar
Left sidebar with:
- User profile card
- Navigation menu
- Active state indicators
- Mobile responsive (hidden on small screens)

### PostCard
Post display component with:
- User info and timestamp
- Content and media
- Like, comment, share actions
- Comments section
- Engagement metrics

### CreatePost
Post creation component with:
- Text input
- Media upload (photo/video)
- Feeling/activity tags
- Location tagging
- Real-time preview

### StoryTray
Stories display with:
- Create story button
- Story cards with gradient rings
- User avatars
- View counts
- Hover effects

### Splashscreen
Loading screen with:
- Animated logo
- Progress bar
- Loading dots
- Modern design

## Features

### Authentication
- Email or mobile number login
- User registration with validation
- Session management
- Password reset (coming soon)

### Posts
- Create posts with text, photos, and videos
- Like, comment, and share posts
- Real-time updates
- Media gallery
- Feeling and activity tags
- Location tagging

### Stories
- Create photo/video stories
- 24-hour expiration
- Story reactions
- View counts
- Full-screen viewer

### Notifications
- Real-time notifications
- Multiple notification types
- Mark as read functionality
- Notification center
- Push notification support

### Real-time Messaging
- Private conversations
- Group chats
- Typing indicators
- Read receipts
- Online status
- Media sharing

### User Profile
- Customizable profile
- Avatar and cover photo
- Bio and personal info
- Posts, photos, videos tabs
- Followers/following
- Verified badges

### Settings
- Profile settings
- Account settings
- Privacy controls
- Notification preferences
- Language selection (6 languages)
- Theme switching (light/dark)
- Security settings

### AI Features (Coming Soon)
- AI content recommendations
- AI chat assistant
- Image recognition
- Auto-generated captions
- Smart notifications

## Multilingual Support

### Supported Languages
- 🇺🇸 English (en)
- 🇫🇷 French (fr)
- 🇲🇬 Malagasy (mg)
- 🇩🇪 German (de)
- 🇪🇸 Spanish (es)
- 🇨🇳 Chinese (ch)

### Implementation
Language files are stored in `src/config/locales/`:
```
locales/
├── en.json
├── fr.json
├── mg.json
├── de.json
├── es.json
└── ch.json
```

### Usage
```typescript
import { t, Locale } from '@/lib/i18n';

const text = t('en', 'common.loading');
```

### Adding New Languages
1. Create a new JSON file in `src/config/locales/`
2. Copy the structure from an existing language file
3. Translate all values
4. Add the language code to `availableLocales` in `i18n.ts`

## Deployment

### Prérequis

- Base de données PostgreSQL (recommandé en production)
- Node.js 18+
- Plateforme d'hébergement (Vercel recommandé)

### Variables d'environnement requises (exemples)

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_URL="https://votre-app.vercel.app"
NEXTAUTH_SECRET="<valeur_secrète_forte>"

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
FACEBOOK_CLIENT_ID="..."
FACEBOOK_CLIENT_SECRET="..."

# Cloudinary (uploads)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Optionnel
OPENAI_API_KEY="..."
NEWS_API_KEY="..."
ADMIN_API_KEY="..."
```

### Étapes de build et déploiement

1. Installer les dépendances :

```bash
npm install
```

2. Générer le client Prisma et pousser le schéma :

```bash
npx prisma generate
npx prisma db push
```

3. Construire l'application :

```bash
npm run build
```

4. Démarrer le serveur de production (si vous utilisez un serveur Node.js) :

```bash
npm start
```

### Déploiement sur Vercel (recommandé)

1. Poussez votre code sur GitHub/GitLab.
2. Importez le projet dans Vercel et liez le dépôt.
3. Dans les Settings > Environment Variables, ajoutez les variables listées ci-dessus (utilisez les valeurs de production).
4. Configurez la commande de build : `npm run build`.
5. Déployez et vérifiez les logs si nécessaire.

Remarques importantes :

- En production, assurez-vous que `NEXTAUTH_URL` contient l'URL publique (HTTPS).
- Utilisez PostgreSQL en production pour la fiabilité et les sauvegardes.
- Configurez `CLOUDINARY_*` pour permettre les uploads côté client signés depuis l'API interne (`/api/uploads/signature`).
- Pour l'API d'administration, remplacez la clé statique `ADMIN_API_KEY` par un mécanisme basé sur les rôles NextAuth si nécessaire.


## Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Test connection with:
npx prisma db pull
```

#### Build Errors
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

#### Type Errors
```bash
# Regenerate types
npx prisma generate
```

#### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

## Development Tips

### Running Development Server
```bash
npm run dev
```

### Database Migrations
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

### Viewing Database
```bash
# Open Prisma Studio
npx prisma studio
```

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use Tailwind CSS for styling
- Keep components small and focused
- Use custom hooks for reusable logic

## Security Considerations

- Always validate user input
- Use prepared statements (Prisma handles this)
- Implement rate limiting
- Secure API routes with authentication
- Use environment variables for secrets
- Enable HTTPS in production
- Implement CORS properly

## Performance Optimization

- Use Next.js Image component for images
- Implement lazy loading
- Use React.memo for expensive components
- Optimize database queries
- Use caching strategies
- Minimize bundle size

## Future Enhancements

1. **Advanced AI Features**
   - Content moderation
   - Spam detection
   - Sentiment analysis

2. **Enhanced Messaging**
   - Video calls
   - Voice messages
   - File sharing

3. **Social Features**
   - Events and calendars
   - Marketplace
   - Jobs board

4. **Analytics**
   - User analytics dashboard
   - Content performance metrics
   - Engagement insights

## Support

For issues and questions:
- Check the documentation
- Review GitHub issues
- Contact the development team

## License

MIT License - See LICENSE file for details

---

Built with ❤️ by the i-Fandray Team