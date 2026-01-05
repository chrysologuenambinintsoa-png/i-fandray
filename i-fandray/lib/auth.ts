import NextAuth, { DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import GitHubProvider from 'next-auth/providers/github';
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

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'email,public_profile',
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          throw new Error('Password is required');
        }

        if (!credentials.email) {
          throw new Error('Email is required');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error('No account found with this email address');
        }

        if (!user.password) {
          throw new Error('This account uses social login. Please use the appropriate social login button.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          image: user.avatar,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async signIn({ user, account, profile }: {
      user: any;
      account: any;
      profile?: any;
    }) {
      if (account?.provider === 'google' || account?.provider === 'facebook' || account?.provider === 'github') {
        try {
          // Check if user exists
          let existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Create new user for social login
            const nameParts = user.name?.split(' ') || [];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            // Generate unique username
            let username = user.email!.split('@')[0];
            let counter = 1;
            while (await prisma.user.findUnique({ where: { username } })) {
              username = `${user.email!.split('@')[0]}${counter}`;
              counter++;
            }

            existingUser = await prisma.user.create({
              data: {
                email: user.email!,
                firstName,
                lastName,
                username,
                avatar: user.image,
                isVerified: true, // Social logins are pre-verified
              },
            });
          }

          // Update user info if needed
          if (existingUser && (!existingUser.avatar || existingUser.avatar !== user.image)) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { avatar: user.image },
            });
          }

          // Attach user id to the token
          user.id = existingUser.id;
          return true;
        } catch (error) {
          console.error('Error during social sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.username = user.username;
        token.email = user.email;
        token.avatar = user.avatar;
        token.bio = user.bio;
        token.isVerified = user.isVerified;
        token.isActive = user.isActive;
        token.language = user.language;
        token.theme = user.theme;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.avatar = token.avatar;
        session.user.bio = token.bio;
        session.user.isVerified = token.isVerified;
        session.user.isActive = token.isActive;
        session.user.language = token.language;
        session.user.theme = token.theme;
        session.user.createdAt = token.createdAt;
        session.user.updatedAt = token.updatedAt;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
};