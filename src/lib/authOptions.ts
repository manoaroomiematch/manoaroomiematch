/* eslint-disable arrow-body-style */
import { compare } from 'bcrypt';
import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'john@foo.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });
        if (!user) {
          return null;
        }

        // Check if user account is deactivated
        if (!user.active) {
          console.log(`Login denied: User account is deactivated - ${credentials.email}`);
          return null;
        }

        // Check if user is currently suspended
        if (user.suspendedUntil && user.suspendedUntil > new Date()) {
          console.log(`Login denied: User is suspended until ${user.suspendedUntil} - ${credentials.email}`);
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: `${user.id}`,
          email: user.email,
          randomKey: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  callbacks: {
    redirect: ({ url, baseUrl }) => {
      // Validate redirect URL to prevent open redirect attacks
      // Only allow relative paths or URLs within the same domain
      if (url.startsWith('/')) {
        // Relative path is safe
        return url;
      }
      if (new URL(url, baseUrl).origin === baseUrl) {
        // Same origin redirect is safe
        return url;
      }
      // Invalid redirect - return to home
      return baseUrl;
    },
    session: ({ session, token }) => {
      // console.log('Session Callback', { session, token })
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          randomKey: token.randomKey,
        },
      };
    },
    jwt: ({ token, user }) => {
      // console.log('JWT Callback', { token, user })
      if (user) {
        // Properly type the user object instead of casting to 'any'
        const typedUser = user as { id: string; randomKey: string };
        return {
          ...token,
          id: typedUser.id,
          randomKey: typedUser.randomKey,
        };
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
