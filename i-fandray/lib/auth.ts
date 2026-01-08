import NextAuth, { DefaultSession, NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      username?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        // Split the name into firstName and lastName
        const nameParts = profile.name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Generate a unique username from email
        const baseUsername = profile.email?.split('@')[0] || profile.name?.toLowerCase().replace(/\s+/g, '') || 'user';

        return {
          id: profile.sub,
          email: profile.email,
          avatar: profile.picture, // Map image to avatar for Prisma
          firstName: firstName,
          lastName: lastName,
          username: baseUsername, // We'll handle uniqueness in the signIn callback
        };
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'email,public_profile',
        },
      },
      userinfo: {
        params: {
          fields: 'id,name,email,picture',
        },
      },
      profile(profile) {
        // Split the name into firstName and lastName
        const nameParts = profile.name?.split(' ') || [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Generate a unique username from email or name
        const baseUsername = profile.email?.split('@')[0] || profile.name?.toLowerCase().replace(/\s+/g, '') || 'user';

        return {
          id: profile.id,
          email: profile.email,
          avatar: profile.picture?.data?.url || profile.picture, // Handle Facebook's nested picture structure
          firstName: firstName,
          lastName: lastName,
          username: baseUsername, // We'll handle uniqueness in the signIn callback
        };
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('[CredentialsProvider] Missing email or password');
          throw new Error('Email and password are required');
        }

        try {
          console.log('[CredentialsProvider] Looking for user with email:', credentials.email);
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.error('[CredentialsProvider] No user found with email:', credentials.email);
            throw new Error('No account found with this email address');
          }

          console.log('[CredentialsProvider] User found:', user.id);

          if (!user.password) {
            console.error('[CredentialsProvider] User has no password (social login only):', user.id);
            throw new Error('This account uses social login. Please use Google or Facebook to sign in.');
          }

          console.log('[CredentialsProvider] Comparing passwords for user:', user.id);
          
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.error('[CredentialsProvider] Invalid password for user:', user.id);
            throw new Error('Invalid password');
          }

          console.log('[CredentialsProvider] Login successful for user:', user.id);

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            image: user.avatar,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
          };
        } catch (error) {
          // Credentials authorization error
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // SignIn callback triggered

        // For OAuth providers, ensure user data is properly formatted
        if (account?.provider === 'google' || account?.provider === 'facebook') {
          // For Facebook, email might not be available, so we allow sign in anyway
          if (account.provider === 'facebook' && !user.email) {
            // Facebook login without email - allowing sign in with generated email
            // Generate a temporary email using Facebook ID
            user.email = `facebook-${account.providerAccountId}@temp.local`;
          } else if (!user.email) {
            // OAuth user has no email for provider
            console.error('[auth][signIn] OAuth user has no email');
            return false;
          }

          // Ensure we have firstName and lastName
          if (!user.firstName || !user.lastName) {
            const nameParts = user.name?.split(' ') ?? [];
            user.firstName = user.firstName ?? nameParts[0] ?? '';
            user.lastName = user.lastName ?? nameParts.slice(1).join(' ') ?? '';
          }

          // Generate unique username if not provided or if it already exists
          if (!user.username) {
            const baseUsername = user.email?.split('@')[0] ?? user.name?.toLowerCase().replace(/\s+/g, '') ?? 'user';
            user.username = baseUsername;
          }

          // Check if username exists and make it unique
          let username = user.username;
          let counter = 1;
          while (true) {
            try {
              const existingUser = await prisma.user.findUnique({
                where: { username }
              });
              if (!existingUser) break;
              username = `${user.username}${counter}`;
              counter++;
            } catch (err) {
              // Error checking username uniqueness
              // If we can't check, use a timestamp-based username
              username = `${user.username}_${Date.now()}`;
              break;
            }
          }
          user.username = username;

          // OAuth user data prepared
          console.log('[auth][signIn] OAuth signin successful for:', user.email);

          return true;
        }

        // For credentials provider, just return true
        console.log('[auth][signIn] Credentials signin successful for:', user.email);
        return true;
      } catch (err: any) {
        // Ensure we log full error and return false instead of redirect
        console.error('[auth][signIn] error:', err);
        return false;
      }
    },

    async jwt({ token, user, account }) {
      // Quand l'utilisateur se connecte, ajouter les infos au token
      if (user) {
        console.log('[auth][jwt] Adding user to token:', user.id);
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.username = user.username;
      }
      return token;
    },

    async session({ session, token }) {
      // Ajouter les infos du token à la session
      if (session?.user && token) {
        console.log('[auth][session] Adding token data to session:', token.email);
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.username = token.username;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect based on URL
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      // Default redirect to /feed for authenticated users
      return `${baseUrl}/feed`;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

export default NextAuth(authOptions);