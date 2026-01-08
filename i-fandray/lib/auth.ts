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
          throw new Error('Email and password are required');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error('No account found with this email address');
          }

          if (!user.password) {
            throw new Error('This account uses social login. Please use Google or Facebook to sign in.');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

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
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account, profile }) {
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
          } catch (error) {
            // Error checking username uniqueness
            // If we can't check, use a timestamp-based username
            username = `${user.username}_${Date.now()}`;
            break;
          }
        }
        user.username = username;

        // OAuth user data prepared

        return true;
      }

      // For credentials provider, just return true
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.username = user.username;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.username = token.username;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to home page which will handle the proper redirection based on auth status
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl; // Redirect to home page instead of /feed directly
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