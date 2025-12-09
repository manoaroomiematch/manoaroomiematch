'use client';

import { SessionProvider } from 'next-auth/react';
import { ProfilePictureProvider } from '@/contexts/ProfilePictureContext';

type Props = {
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * Providers Component
 *
 * Wraps the application with necessary context providers:
 * - SessionProvider: NextAuth session management
 * - ProfilePictureProvider: Global profile picture state for real-time updates
 */
const Providers = ({ children }: Props) => (
  <SessionProvider>
    <ProfilePictureProvider>
      {children}
    </ProfilePictureProvider>
  </SessionProvider>
);

export default Providers;
