'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useSession } from 'next-auth/react';

interface ProfilePictureContextType {
  photoUrl: string | null;
  isLoading: boolean;
  updatePhotoUrl: (url: string | null) => void;
  uploadPicture: (file: File) => Promise<{ success: boolean; error?: string }>;
  deletePicture: () => Promise<{ success: boolean; error?: string }>;
  refreshPicture: () => Promise<void>;
}

const ProfilePictureContext = createContext<ProfilePictureContextType | undefined>(undefined);

/**
 * ProfilePictureProvider
 *
 * Global state management for the current user's profile picture.
 * Wraps the app to provide profile picture state to all components
 * without prop drilling. Updates propagate instantly across the UI.
 */
export function ProfilePictureProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch initial photo URL when session loads
  const fetchPicture = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.email) {
      return;
    }

    try {
      const res = await fetch('/api/profile/picture');
      if (res.ok) {
        const data = await res.json();
        setPhotoUrl(data.photoUrl || null);
      } else if (res.status !== 401) {
        // Don't treat 401 as an error - user might just not be authenticated yet
        console.error('Failed to fetch profile picture:', res.status);
      }
    } catch (error) {
      // Silently fail - the picture fetch is non-critical
      console.error('Failed to fetch profile picture:', error);
    } finally {
      setHasFetched(true);
    }
  }, [session?.user?.email, status]);

  useEffect(() => {
    if (status === 'authenticated' && !hasFetched) {
      fetchPicture();
    }
    // Reset when user logs out
    if (status === 'unauthenticated') {
      setPhotoUrl(null);
      setHasFetched(false);
    }
  }, [status, hasFetched, fetchPicture]);

  // Manually update the photo URL (for optimistic updates)
  const updatePhotoUrl = useCallback((url: string | null) => {
    setPhotoUrl(url);
  }, []);

  // Refresh picture from server
  const refreshPicture = useCallback(async () => {
    setHasFetched(false);
    await fetchPicture();
  }, [fetchPicture]);

  // Upload a new profile picture
  const uploadPicture = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/profile/upload-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Upload failed' };
      }

      // Update context state immediately
      setPhotoUrl(data.photoUrl);
      return { success: true };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Upload failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete the current profile picture
  const deletePicture = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile/delete-picture', {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'Delete failed' };
      }

      // Clear the photo URL immediately
      setPhotoUrl(null);
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: 'Delete failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      photoUrl,
      isLoading,
      updatePhotoUrl,
      uploadPicture,
      deletePicture,
      refreshPicture,
    }),
    [photoUrl, isLoading, updatePhotoUrl, uploadPicture, deletePicture, refreshPicture],
  );

  return (
    <ProfilePictureContext.Provider value={value}>
      {children}
    </ProfilePictureContext.Provider>
  );
}

/**
 * useProfilePicture hook
 *
 * Access the current user's profile picture state and actions.
 * Must be used within a ProfilePictureProvider.
 *
 * @example
 * const { photoUrl, uploadPicture, deletePicture, isLoading } = useProfilePicture();
 */
export function useProfilePicture() {
  const context = useContext(ProfilePictureContext);
  if (context === undefined) {
    throw new Error('useProfilePicture must be used within a ProfilePictureProvider');
  }
  return context;
}

export default ProfilePictureContext;
