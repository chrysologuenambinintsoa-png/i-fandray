# 🌟 i-fandray — Plateforme sociale (version française)

Ce dépôt contient la base d'une application sociale moderne construite avec Next.js (App Router), TypeScript, Prisma et Tailwind.

Ce README a été adapté à l'état actuel du projet : fonctionnalités déjà implémentées, variables d'environnement requises, démarrage local et points à valider avant déploiement.

---

**État actuel (synthèse)**
- Authentification : NextAuth (Credentials + OAuth), sessions stockées en BDD via Prisma.
- Uploads : Upload signé Cloudinary (endpoint serveur + helper client).
- Réinitialisation de mot de passe : lien + nouveau flux par code email à 6 chiffres (endpoints et pages frontend ajoutés).
- Admin : API d'administration pour création d'utilisateurs et scripts CLI (ex. `scripts/create-user.js`).
- UI : `components/Header.tsx` et `components/Sidebar.tsx` restylés (palette vert/bleu/blanc). Welcome flow centralisé (`app/welcome/page.tsx`).
- Corrections récentes : handlers posts/likes/comments modifiés pour ajouter des fallbacks de session (getToken / recherche session Prisma) afin de réduire des 401 intempestifs.

---

**Ressources importantes**
- Code client/serveur principal : `app/`
- Composants UI : `components/` (Header, Sidebar, CreatePost, etc.)
- API sensibles : `app/api/posts/`, `app/api/auth/`, `app/api/uploads/`
- Fichier de config Prisma : `prisma/schema.prisma`

---

**Variables d'environnement requises**
Créez un fichier `.env.local` et définissez au minimum :

- `NEXTAUTH_URL` — URL de l'app (ex. http://localhost:3000)
- `NEXTAUTH_SECRET`
- `DATABASE_URL` — (en prod : PostgreSQL)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — pour envoi d'emails
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `ADMIN_API_KEY` — clé admin utilisée par les scripts/endpoint d'administration

Notes : d'autres variables (Google/Facebook OAuth, OpenAI, NEWS_API_KEY) sont optionnelles selon les fonctionnalités activées.

---

**Installation & démarrage local**

1. Installer les dépendances :

```bash
npm install
```

2. Préparer l'environnement :

```bash
cp .env.example .env.local
# Éditez .env.local avec les variables listées ci-dessus
```

3. Générer Prisma et initialiser la BDD :

```bash
npx prisma generate
npx prisma db push
# (optionnel) npx tsx prisma/seed.ts
```

4. Lancer en développement :

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000.

---

**Déploiement (Vercel)**
- Configurez les mêmes variables d'environnement dans la dashboard Vercel.
- Commande de build : `npm run build`.
- Assurez-vous d'utiliser PostgreSQL en production et de régler `DATABASE_URL` en conséquence.

Remarque : certaines routes (upload signé Cloudinary, endpoints d'admin) sont serverless-friendly mais vérifiez les timeouts et la configuration d'environnement sur la plateforme choisie.

---

**Fonctionnalités implémentées (points clefs)**
- Auth : NextAuth avec persistance Prisma, login multi-méthode.
- Uploads : Cloudinary (signature serveur + helper client).
- Password reset : lien + code email 6 chiffres (nouveau flow ajouté).
- Admin API : endpoint de création d'utilisateur + scripts.
- UI : Header/Sidebar redesign, Welcome flow (`seenWelcome` localStorage).
- Corrections récentes : fallbacks de session ajoutés dans `app/api/posts/*` pour réduire 401s.

---

**Problèmes connus & validations à effectuer**
- Vérifier en local les flows suivants après avoir démarré le serveur et réglé les variables SMTP/Twilio/Cloudinary :
  - Lecture du feed, création/suppression de posts
  - Like/unlike et création de commentaires
  - Uploads Cloudinary côté client
  - Réinitialisation par code email 6 chiffres

- Si vous observez encore des 401 lors d'actions sur des posts, activez le serveur, reproduisez l'appel et vérifiez les logs ; les handlers ont déjà des fallbacks `getToken` et recherche de `sessionToken` en BDD.

---

**Tests & scripts utiles**
- Linter : `npm run lint` (ESLint)
- Tests unitaires : `npm test` (Jest) — config présente mais exécution locale dépend des services configurés
- E2E : Playwright (configuration présente dans `playwright.config.ts`)

---

**Contribution & contact**
- Pour contribuer : fork → branche → PR. Respectez les règles de lint et tests.
- Licence : voir `LICENSE`.

Si vous voulez, je peux :
- ajouter des logs ciblés dans les endpoints problématiques pour diagnostiquer les 401,
- traduire d'autres fichiers (`TODO.md`, `TESTING.md`, `DOCUMENTATION.md`),
- ou exécuter une checklist de tests locaux (si vous lancez le serveur et me donnez accès aux résultats).

Fichier mis à jour : [i-fandray/README.md](i-fandray/README.md)


## 🎨 Customization

### Themes
The application supports light and dark themes. Theme switching is available in user settings.

### Colors
Primary color scheme:
- **Primary**: Green (#10B981)
- **Secondary**: Blue (#3B82F6)
- **Accent**: Purple (#8B5CF6)
- **Background**: White/Gray variants

### Branding
Update branding elements in:
- `public/` - Static assets and icons
- `styles/globals.css` - Global styles and CSS variables
- `config/locales/` - Text content and translations

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint configuration
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - The React framework for production
- **Prisma** - Next-generation ORM
- **Tailwind CSS** - A utility-first CSS framework
- **NewsAPI** - Real-time news data provider
- **OpenAI** - AI-powered features
- **Socket.io** - Real-time bidirectional communication

## 📞 Support

For support, questions, or contributions:

- 📧 **Email**: support@ifandray.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/i-fandray/issues)
- 📖 **Documentation**: [Wiki](https://github.com/yourusername/i-fandray/wiki)

---

<div align="center">

**Built with ❤️ using Next.js, React, and modern web technologies**

⭐ **Star this repository** if you find it helpful!

[🌐 Live Demo](https://i-fandray.vercel.app) • [📚 Documentation](https://docs.i-fandray.com) • [🐛 Report Bug](https://github.com/yourusername/i-fandray/issues)

</div>

## ✨ Features

### 🔐 Authentication & User Management
- **Multi-method Login**: Email or mobile number authentication
- **Secure Registration**: Complete user onboarding flow
- **Password Recovery**: SMS/email-based password reset
- **Profile Management**: Customizable profiles with avatars and bios
- **Privacy Controls**: Granular privacy settings

### 📱 Core Social Features
- **Real-time Posts**: Create, edit, like, comment, and share posts
- **Rich Media Support**: Images, videos, and documents
- **Stories**: Ephemeral content with 24-hour expiration
- **Groups**: Create and manage community groups
- **Friends System**: Send friend requests and manage connections
- **Live Streaming**: Broadcast and watch live streams with WebRTC

### 💬 Communication
- **Real-time Messaging**: Instant messaging with WebSocket support
- **Group Chats**: Multi-user conversations
- **Voice Messages**: Audio messaging capabilities
- **Video Calls**: Peer-to-peer video calling
- **Notifications**: Real-time push notifications

### 📰 News & Content
- **NewsAPI Integration**: Real-time news aggregation from global sources
- **Category Filtering**: Technology, Business, Sports, Entertainment, Science
- **Trending Content**: Highlighted trending articles
- **Bookmark System**: Save favorite articles
- **Content Sharing**: Share news across the platform

### 🤖 AI-Powered Features
- **AI Content Recommender**: Personalized content suggestions
- **Smart Captions**: AI-generated post descriptions
- **Image Analysis**: AI-powered image recognition
- **Intelligent Assistant**: Chat-based AI helper

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach for all devices
- **Dark/Light Themes**: Theme switching support
- **Multilingual**: Support for 6 languages (EN, FR, MG, DE, ES, ZH)
- **Smooth Animations**: Framer Motion animations
- **Progressive Web App**: PWA-ready for mobile installation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand
- **Real-time**: Socket.io Client

### Backend & Database
- **API**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time Server**: Socket.io
- **File Upload**: Multer with Sharp image processing
- **Email Service**: Nodemailer
- **SMS Service**: Twilio

### External Services
- **News API**: NewsAPI for real-time news
- **AI Services**: OpenAI API integration
- **Image Processing**: Sharp for optimization

### Development Tools
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Database Management**: Prisma Studio
- **Process Management**: PM2 ecosystem
- **Development**: Concurrently for multi-process dev

## 📁 Project Structure

```
i-fandray/
├── app/                          # Next.js App Router
│   ├── actualite/               # News page
│   ├── api/                     # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── conversations/      # Chat API
│   │   ├── friends/            # Friends management
│   │   ├── groups/             # Groups API
│   │   ├── news/               # News aggregation
│   │   ├── notifications/      # Notifications API
│   │   ├── posts/              # Posts CRUD
│   │   ├── stories/            # Stories API
│   │   └── upload/             # File upload
│   ├── auth/                   # Auth pages (login, register, etc.)
│   ├── feed/                   # Main feed page
│   ├── friends/                # Friends page
│   ├── groups/                 # Groups page
│   ├── live/                   # Live streaming page
│   ├── messages/               # Messages page
│   ├── profile/                # Profile pages
│   ├── settings/               # Settings pages
│   ├── stories/                # Stories page
│   └── welcome/                # Welcome/onboarding
├── components/                  # React components
│   ├── AIContentRecommender.tsx
│   ├── CreatePost.tsx
│   ├── Header.tsx
│   ├── NewsAggregator.tsx
│   ├── NotificationsPanel.tsx
│   ├── PostCard.tsx
│   ├── Sidebar.tsx
│   ├── VideoCall.tsx
│   ├── VoiceMessage.tsx
│   └── animations/
├── config/                      # Configuration
│   └── locales/                 # Translation files
├── hooks/                       # Custom React hooks
├── lib/                         # Utilities and services
│   ├── auth.ts                 # Auth configuration
│   ├── newsService.ts          # News API service
│   ├── prisma.ts               # Database client
│   └── utils.ts                # Helper functions
├── prisma/                      # Database
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── public/                      # Static assets
│   └── uploads/                # User uploaded files
├── scripts/                     # Utility scripts
│   └── sync-news.ts            # News synchronization
├── signaling/                   # WebRTC signaling server
├── styles/                      # Global styles
│   └── globals.css
└── types/                       # TypeScript definitions
```

## 🚀 Quick Start

### Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** 18.17.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd i-fandray
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Copy the environment template and configure your variables:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth.js
   NEXTAUTH_SECRET="your-super-secret-key-here-change-this"
   NEXTAUTH_URL="http://localhost:3000"

   # News API (Get your key from https://newsapi.org)
   NEWS_API_KEY="your-newsapi-key-here"

   # OpenAI (Optional - for AI features)
   OPENAI_API_KEY="your-openai-api-key-here"

   # Email Service (Optional - for password reset)
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@ifandray.com"

   # Twilio (Optional - for SMS features)
   TWILIO_ACCOUNT_SID="your-twilio-sid"
   TWILIO_AUTH_TOKEN="your-twilio-token"
   TWILIO_PHONE_NUMBER="+1234567890"
   ```

4. **Database Setup**

   Generate Prisma client and run migrations:
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # (Optional) Seed the database with sample data
   npx tsx prisma/seed.ts
   ```

5. **Sync News Content** (Optional)

   Populate the database with news articles:
   ```bash
   npm run sync-news
   ```

### Development

Start the development servers:

```bash
# Start Next.js development server only
npm run dev

# Start with signaling server for real-time features
npm run dev:all

# Windows PowerShell (alternative)
npm run dev:all:win

# Using PM2 process manager
npm run dev:all:pm2
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 📊 Database Schema

The application uses SQLite with Prisma ORM. Key models include:

### Core Models
- **User**: User accounts, profiles, and authentication
- **Post**: User posts with media attachments
- **Comment**: Post comments and replies
- **Like**: Post likes and reactions
- **Share**: Post sharing functionality
- **Story**: Ephemeral content (24h expiration)

### Social Features
- **Friend**: Friend relationships and requests
- **Group**: Community groups and memberships
- **Conversation**: Chat conversations
- **Message**: Individual messages
- **Notification**: User notifications

### Media & Content
- **News**: News articles from NewsAPI
- **LiveStream**: Live streaming sessions
- **StoryReaction**: Story interactions

### System Models
- **Block**: User blocking functionality
- **Follow**: User following relationships

## 🔌 API Reference

### Authentication Endpoints
```
POST /api/auth/register          # User registration
POST /api/auth/login             # User login
POST /api/auth/logout            # User logout
POST /api/auth/forgot-password   # Password reset request
POST /api/auth/reset-password    # Password reset confirmation
POST /api/auth/verify-code       # SMS verification
```

### Social Endpoints
```
GET  /api/posts                  # Get posts feed
POST /api/posts                  # Create new post
PUT  /api/posts/[id]             # Update post
DELETE /api/posts/[id]           # Delete post
POST /api/posts/[id]/comments    # Add comment
POST /api/posts/[id]/likes       # Like/unlike post
```

### Real-time Features
```
GET  /api/conversations          # Get user conversations
POST /api/conversations          # Create conversation
GET  /api/messages               # Get messages
POST /api/messages               # Send message
```

### News & Content
```
GET  /api/news                   # Get news articles
POST /api/news/sync              # Sync news from API
GET  /api/news/[id]              # Get specific article
```

### Media Upload
```
POST /api/upload                 # Upload files/images
```

## 🌐 Internationalization

The application supports 6 languages:

- 🇺🇸 **English** (en) - Default
- 🇫🇷 **French** (fr)
- 🇲🇬 **Malagasy** (mg)
- 🇩🇪 **German** (de)
- 🇪🇸 **Spanish** (es)
- 🇨🇳 **Chinese** (zh)

Language files are located in `config/locales/` and can be extended by adding new JSON files.

## 🎨 Customization

### Themes
The application supports light and dark themes. Theme switching is available in user settings.

### Colors
Primary color scheme:
- **Primary**: Green (#10B981)
- **Secondary**: Blue (#3B82F6)
- **Accent**: Purple (#8B5CF6)
- **Background**: White/Gray variants

### Branding
Update branding elements in:
- `public/` - Static assets and icons
- `styles/globals.css` - Global styles and CSS variables
- `config/locales/` - Text content and translations

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use ESLint configuration
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** - The React framework for production
- **Prisma** - Next-generation ORM
- **Tailwind CSS** - A utility-first CSS framework
- **NewsAPI** - Real-time news data provider
- **OpenAI** - AI-powered features
- **Socket.io** - Real-time bidirectional communication

## 📞 Support

For support, questions, or contributions:

- 📧 **Email**: support@ifandray.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/i-fandray/issues)
- 📖 **Documentation**: [Wiki](https://github.com/yourusername/i-fandray/wiki)

---

<div align="center">

**Built with ❤️ using Next.js, React, and modern web technologies**

⭐ **Star this repository** if you find it helpful!

[🌐 Live Demo](https://i-fandray.vercel.app) • [📚 Documentation](https://docs.i-fandray.com) • [🐛 Report Bug](https://github.com/yourusername/i-fandray/issues)

</div>