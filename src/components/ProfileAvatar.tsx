'use client';

import Image from 'next/image';
import { PersonCircle } from 'react-bootstrap-icons';
import { useProfilePicture } from '@/contexts/ProfilePictureContext';

interface ProfileAvatarProps {
  /** Size of the avatar in pixels */
  // eslint-disable-next-line react/require-default-props
  size?: number;
  /** Additional CSS classes */
  // eslint-disable-next-line react/require-default-props
  className?: string;
  /**
   * If true, displays the current user's profile picture from context.
   * If false, displays the provided photoUrl prop.
   */
  // eslint-disable-next-line react/require-default-props
  useCurrentUser?: boolean;
  /** Photo URL to display when useCurrentUser is false */
  // eslint-disable-next-line react/require-default-props
  photoUrl?: string | null;
  /** Alt text for the image */
  // eslint-disable-next-line react/require-default-props
  alt?: string;
  /** Whether to show a border around the avatar */
  // eslint-disable-next-line react/require-default-props
  showBorder?: boolean;
  /** Custom border color */
  // eslint-disable-next-line react/require-default-props
  borderColor?: string;
}

/**
 * ProfileAvatar Component
 *
 * A reusable avatar component that can either display:
 * 1. The current user's profile picture (from context) - useCurrentUser=true
 * 2. A provided photo URL - useCurrentUser=false
 *
 * Falls back to a person icon when no photo is available.
 *
 * @example
 * // Current user's avatar (auto-updates when picture changes)
 * <ProfileAvatar size={40} useCurrentUser />
 *
 * // Another user's avatar
 * <ProfileAvatar size={64} useCurrentUser={false} photoUrl={otherUser.photoUrl} />
 */
export default function ProfileAvatar({
  size = 40,
  className = '',
  useCurrentUser = true,
  photoUrl: providedPhotoUrl,
  alt = 'Profile',
  showBorder = true,
  borderColor = '#dee2e6',
}: ProfileAvatarProps) {
  // Only use the hook if we're displaying the current user
  // This avoids unnecessary context subscriptions for other users' avatars
  const context = useProfilePicture();
  const contextPhotoUrl = useCurrentUser ? context.photoUrl : null;

  const displayUrl = useCurrentUser ? contextPhotoUrl : providedPhotoUrl;

  return (
    <div
      className={`d-inline-flex align-items-center justify-content-center flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
        border: showBorder ? `2px solid ${borderColor}` : 'none',
        position: 'relative',
      }}
    >
      {displayUrl ? (
        <Image
          src={displayUrl}
          alt={alt}
          width={size}
          height={size}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
          unoptimized={displayUrl.startsWith('data:')} // Handle base64 previews
        />
      ) : (
        <PersonCircle
          size={Math.round(size * 0.6)}
          className="text-secondary"
        />
      )}
    </div>
  );
}
