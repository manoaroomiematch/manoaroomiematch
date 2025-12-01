import { DefaultSession } from 'next-auth';

/**
 * Type declarations extending NextAuth to support the 'randomKey' field
 * This field stores the user's role (e.g., 'ADMIN', 'USER')
 * Required for admin authentication checks in API endpoints and pages
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      randomKey: string; // User role field (e.g., 'ADMIN')
    } & DefaultSession['user']
  }

  interface User {
    randomKey: string; // User role field from database
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    randomKey: string; // User role field stored in JWT token
  }
}
