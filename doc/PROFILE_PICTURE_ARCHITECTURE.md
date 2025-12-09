# Profile Picture Upload Architecture

## Overview

This document outlines the complete architecture for implementing profile picture uploads in ManoaRoomiematch. The solution includes frontend UI, backend API, file validation, storage, database updates, and security protections. Profile pictures will update across the app in real-time without requiring full page navigation.

---

## Table of Contents

1. [Architecture Diagram](#architecture-diagram)
2. [Database Schema Changes](#database-schema-changes)
3. [Storage Strategy](#storage-strategy)
4. [Backend API Endpoints](#backend-api-endpoints)
5. [Frontend Components](#frontend-components)
6. [File Validation & Security](#file-validation--security)
7. [Real-time Updates (No Full Navigation)](#real-time-updates-no-full-navigation)
8. [Implementation Plan](#implementation-plan)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────────┐  │
│  │  Edit Profile    │    │     Navbar       │    │  Profile/Match Cards │  │
│  │  (Upload UI)     │    │  (Avatar Display)│    │   (Avatar Display)   │  │
│  └────────┬─────────┘    └────────┬─────────┘    └──────────┬───────────┘  │
│           │                       │                          │              │
│           │              ┌────────┴──────────────────────────┤              │
│           │              │     ProfilePictureContext         │              │
│           │              │   (Global State Management)       │              │
│           │              └────────┬──────────────────────────┘              │
│           │                       │                                         │
│           ▼                       ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     ProfilePictureProvider                            │  │
│  │  • Manages current user's profile picture URL                        │  │
│  │  • Provides updateProfilePicture() function                          │  │
│  │  • Broadcasts changes to all subscribed components                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NEXT.JS API ROUTES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  POST /api/profile/upload-picture     DELETE /api/profile/delete-picture   │
│  ┌─────────────────────────────┐      ┌─────────────────────────────────┐  │
│  │ 1. Auth check               │      │ 1. Auth check                   │  │
│  │ 2. File validation          │      │ 2. Delete from storage          │  │
│  │ 3. Image processing         │      │ 3. Update DB (set null)         │  │
│  │ 4. Upload to storage        │      └─────────────────────────────────┘  │
│  │ 5. Update DB with URL       │                                           │
│  │ 6. Delete old image         │                                           │
│  └─────────────────────────────┘                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
            ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
            │   Vercel     │  │  Cloudinary  │  │    AWS S3    │
            │    Blob      │  │   (Alt)      │  │    (Alt)     │
            │   Storage    │  │              │  │              │
            └──────────────┘  └──────────────┘  └──────────────┘
                                     │
                                     ▼
                          ┌──────────────────────┐
                          │    PostgreSQL DB     │
                          │  UserProfile.photoUrl│
                          └──────────────────────┘
```

---

## Database Schema Changes

The current `UserProfile` model already has a `photoUrl` field. No schema changes required:

```prisma
model UserProfile {
  id              String   @id @default(cuid())
  userId          Int      @unique
  // ... other fields
  photoUrl        String?  // ✅ Already exists
  // ...
}
```

---

## Storage Strategy

### Recommended: Vercel Blob Storage

Since the project is built with Next.js and likely deployed on Vercel, **Vercel Blob** is the recommended storage solution for simplicity and integration.

#### Why Vercel Blob?
- Zero configuration with Vercel deployments
- Automatic CDN distribution
- Simple SDK integration
- Pay-per-use pricing
- Automatic image optimization with Next.js Image

#### Alternative Options:

| Storage Option | Pros | Cons |
|---------------|------|------|
| **Vercel Blob** | Easy setup, CDN included, Next.js native | Vercel-specific |
| **Cloudinary** | Powerful transformations, free tier | External service |
| **AWS S3 + CloudFront** | Scalable, industry standard | More complex setup |
| **Supabase Storage** | Good if using Supabase | External service |
| **Local `/public` folder** | Simple | Not scalable, no CDN |

### Storage Structure

```
/profile-pictures/
  └── {userId}/
      └── {timestamp}-{randomId}.{ext}
```

Example: `/profile-pictures/user_abc123/1702056789-x7k2m.jpg`

---

## Backend API Endpoints

### 1. Upload Profile Picture

**Endpoint:** `POST /api/profile/upload-picture`

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (image file)

**Response:**
```json
{
  "success": true,
  "photoUrl": "https://blob.vercel-storage.com/profile-pictures/..."
}
```

**Implementation Flow:**
```
1. Authenticate user via session
2. Validate file:
   - Check file exists
   - Validate MIME type (image/jpeg, image/png, image/webp, image/gif)
   - Check file size (max 5MB)
   - Validate image dimensions (min 100x100, max 4096x4096)
   - Scan for malicious content (magic bytes check)
3. Process image:
   - Resize to max 800x800 (preserving aspect ratio)
   - Convert to WebP for optimization (optional)
   - Strip EXIF metadata for privacy
4. Upload to storage with unique filename
5. Get old photoUrl from database
6. Update UserProfile.photoUrl in database
7. Delete old image from storage (if exists)
8. Return new photoUrl
```

### 2. Delete Profile Picture

**Endpoint:** `DELETE /api/profile/delete-picture`

**Response:**
```json
{
  "success": true
}
```

---

## Frontend Components

### 1. ProfilePictureContext (Global State)

Creates a React Context to share profile picture state across all components without prop drilling.

```typescript
// src/contexts/ProfilePictureContext.tsx

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';

interface ProfilePictureContextType {
  photoUrl: string | null;
  isLoading: boolean;
  updatePhotoUrl: (url: string | null) => void;
  uploadPicture: (file: File) => Promise<{ success: boolean; error?: string }>;
  deletePicture: () => Promise<{ success: boolean; error?: string }>;
}

const ProfilePictureContext = createContext<ProfilePictureContextType | undefined>(undefined);

export function ProfilePictureProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial photo URL when session loads
  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/profile/picture')
        .then(res => res.json())
        .then(data => {
          if (data.photoUrl) setPhotoUrl(data.photoUrl);
        })
        .catch(console.error);
    }
  }, [session?.user?.email]);

  const updatePhotoUrl = useCallback((url: string | null) => {
    setPhotoUrl(url);
  }, []);

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
        return { success: false, error: data.error };
      }
      
      setPhotoUrl(data.photoUrl);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Upload failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePicture = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile/delete-picture', {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error };
      }
      
      setPhotoUrl(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Delete failed' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({
    photoUrl,
    isLoading,
    updatePhotoUrl,
    uploadPicture,
    deletePicture,
  }), [photoUrl, isLoading, updatePhotoUrl, uploadPicture, deletePicture]);

  return (
    <ProfilePictureContext.Provider value={value}>
      {children}
    </ProfilePictureContext.Provider>
  );
}

export function useProfilePicture() {
  const context = useContext(ProfilePictureContext);
  if (context === undefined) {
    throw new Error('useProfilePicture must be used within a ProfilePictureProvider');
  }
  return context;
}
```

### 2. ProfilePictureUpload Component

A reusable upload component with drag-and-drop, preview, and progress indication.

```typescript
// src/components/ProfilePictureUpload.tsx

'use client';

import { useState, useRef, useCallback } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { Upload, Trash, PersonCircle, Camera } from 'react-bootstrap-icons';
import Image from 'next/image';
import { useProfilePicture } from '@/contexts/ProfilePictureContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ProfilePictureUpload() {
  const { photoUrl, isLoading, uploadPicture, deletePicture } = useProfilePicture();
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, WebP, or GIF image';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image must be less than 5MB';
    }
    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    const result = await uploadPicture(file);
    if (!result.success) {
      setError(result.error || 'Upload failed');
      setPreview(null);
    } else {
      setPreview(null); // Clear preview, use actual URL
    }
  }, [uploadPicture]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDelete = async () => {
    const result = await deletePicture();
    if (!result.success) {
      setError(result.error || 'Delete failed');
    }
  };

  const displayUrl = preview || photoUrl;

  return (
    <div className="text-center">
      {/* Profile Picture Display */}
      <div
        className={`position-relative mx-auto mb-3 ${dragActive ? 'border-primary' : ''}`}
        style={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          border: dragActive ? '3px dashed #0d6efd' : '3px solid #dee2e6',
          overflow: 'hidden',
          cursor: 'pointer',
          backgroundColor: '#f8f9fa',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="Profile"
            fill
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100">
            <PersonCircle size={80} className="text-secondary" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: 0,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
        >
          <Camera size={32} className="text-white" />
        </div>

        {/* Loading spinner */}
        {isLoading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
          >
            <Spinner animation="border" variant="primary" />
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleChange}
        className="d-none"
      />

      {/* Action buttons */}
      <div className="d-flex justify-content-center gap-2 mb-2">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload className="me-1" />
          {photoUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>
        
        {photoUrl && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash className="me-1" />
            Remove
          </Button>
        )}
      </div>

      {/* Helper text */}
      <small className="text-muted d-block">
        Drag & drop or click to upload
        <br />
        JPG, PNG, WebP, or GIF (max 5MB)
      </small>

      {/* Error display */}
      {error && (
        <Alert variant="danger" className="mt-2 py-2">
          {error}
        </Alert>
      )}
    </div>
  );
}
```

### 3. ProfileAvatar Component

A reusable avatar display component that subscribes to the context.

```typescript
// src/components/ProfileAvatar.tsx

'use client';

import Image from 'next/image';
import { PersonCircle } from 'react-bootstrap-icons';
import { useProfilePicture } from '@/contexts/ProfilePictureContext';

interface ProfileAvatarProps {
  size?: number;
  className?: string;
  showCurrentUser?: boolean; // If true, uses context; if false, uses provided photoUrl
  photoUrl?: string | null;
  alt?: string;
}

export default function ProfileAvatar({
  size = 40,
  className = '',
  showCurrentUser = true,
  photoUrl: providedPhotoUrl,
  alt = 'Profile',
}: ProfileAvatarProps) {
  const { photoUrl: contextPhotoUrl } = useProfilePicture();
  
  const displayUrl = showCurrentUser ? contextPhotoUrl : providedPhotoUrl;

  return (
    <div
      className={`d-inline-flex align-items-center justify-content-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#f8f9fa',
        border: '2px solid #dee2e6',
      }}
    >
      {displayUrl ? (
        <Image
          src={displayUrl}
          alt={alt}
          width={size}
          height={size}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <PersonCircle size={size * 0.7} className="text-secondary" />
      )}
    </div>
  );
}
```

---

## File Validation & Security

### Client-Side Validation (First Line of Defense)

```typescript
// Validation before upload
const validateFile = (file: File): ValidationResult => {
  const errors: string[] = [];
  
  // 1. File type validation
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Allowed: JPG, PNG, WebP, GIF');
  }
  
  // 2. File size validation (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push('File too large. Maximum size: 5MB');
  }
  
  // 3. File name sanitization
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return {
    valid: errors.length === 0,
    errors,
    sanitizedName,
  };
};
```

### Server-Side Validation (Critical Security)

```typescript
// API route validation
async function validateUpload(formData: FormData): Promise<ValidationResult> {
  const file = formData.get('file') as File;
  
  // 1. File existence check
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No file provided' };
  }
  
  // 2. MIME type validation (from Content-Type header)
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  // 3. File size check
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File too large' };
  }
  
  // 4. Magic bytes validation (prevent MIME spoofing)
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 12));
  
  const signatures: { [key: string]: number[] } = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
  };
  
  const isValidSignature = Object.entries(signatures).some(([mime, sig]) => {
    if (mime === file.type) {
      return sig.every((byte, index) => bytes[index] === byte);
    }
    return false;
  });
  
  if (!isValidSignature) {
    return { valid: false, error: 'File content does not match type' };
  }
  
  // 5. Image dimension validation
  // Use sharp or similar library to check dimensions
  const image = await sharp(buffer).metadata();
  if (!image.width || !image.height) {
    return { valid: false, error: 'Could not read image dimensions' };
  }
  if (image.width < 100 || image.height < 100) {
    return { valid: false, error: 'Image too small. Minimum: 100x100px' };
  }
  if (image.width > 4096 || image.height > 4096) {
    return { valid: false, error: 'Image too large. Maximum: 4096x4096px' };
  }
  
  return { valid: true };
}
```

### Security Measures Summary

| Threat | Mitigation |
|--------|------------|
| **Malicious file upload** | Magic bytes validation, server-side type checking |
| **File size DoS** | Client + server size limits (5MB) |
| **Path traversal** | Generate unique filenames, never use user input in paths |
| **XSS via filename** | Sanitize filenames, store with generated names |
| **EXIF data privacy** | Strip metadata during processing |
| **Unauthorized access** | Session validation before any operation |
| **MIME type spoofing** | Validate magic bytes, not just Content-Type |
| **Image bombs** | Dimension limits, processing timeouts |

---

## Real-time Updates (No Full Navigation)

The key to updating profile pictures across the app without full page navigation is the **React Context pattern** combined with **optimistic updates**.

### How It Works

1. **ProfilePictureProvider** wraps the entire app (in `providers.tsx`)
2. All components that need the current user's profile picture use `useProfilePicture()` hook
3. When a picture is uploaded/changed:
   - The context state updates immediately
   - All subscribed components re-render with the new URL
   - No page refresh or navigation needed

### Integration Points

```typescript
// 1. Update providers.tsx to include ProfilePictureProvider
// src/app/providers.tsx

'use client';

import { SessionProvider } from 'next-auth/react';
import { ProfilePictureProvider } from '@/contexts/ProfilePictureContext';

type Props = {
  children?: React.ReactNode;
};

const Providers = ({ children }: Props) => (
  <SessionProvider>
    <ProfilePictureProvider>
      {children}
    </ProfilePictureProvider>
  </SessionProvider>
);

export default Providers;
```

```typescript
// 2. Update Navbar to use ProfileAvatar
// In Navbar.tsx, replace email display with avatar

import ProfileAvatar from '@/components/ProfileAvatar';

// In the dropdown trigger:
<NavDropdown
  id="login-dropdown"
  title={
    <span className="d-flex align-items-center gap-2">
      <ProfileAvatar size={28} />
      {currentUser}
    </span>
  }
>
```

```typescript
// 3. Update edit-profile page to use ProfilePictureUpload
// Replace current photo section with:

import ProfilePictureUpload from '@/components/ProfilePictureUpload';

// In the component:
<ProfilePictureUpload />
```

---

## Implementation Plan

### Phase 1: Infrastructure Setup

1. **Install dependencies**
   ```bash
   npm install @vercel/blob sharp
   npm install -D @types/sharp
   ```

2. **Configure environment variables**
   ```env
   BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
   ```

3. **Update next.config.mjs for image domains**
   ```javascript
   const nextConfig = {
     images: {
       remotePatterns: [
         {
           protocol: 'https',
           hostname: '*.public.blob.vercel-storage.com',
         },
       ],
     },
   };
   ```

### Phase 2: Backend Implementation

1. Create `/api/profile/upload-picture/route.ts`
2. Create `/api/profile/delete-picture/route.ts`
3. Create `/api/profile/picture/route.ts` (GET current picture)
4. Add image processing utilities

### Phase 3: Frontend Implementation

1. Create `ProfilePictureContext.tsx`
2. Create `ProfilePictureUpload.tsx`
3. Create `ProfileAvatar.tsx`
4. Update `providers.tsx`
5. Update `Navbar.tsx`
6. Update edit-profile page

### Phase 4: Testing & Security

1. Test file upload with various file types
2. Test file size limits
3. Test malicious file detection
4. Test unauthorized access prevention
5. Test real-time updates across components

### Phase 5: Polish

1. Add loading states and animations
2. Add error handling and user feedback
3. Add image cropping UI (optional)
4. Optimize image loading with blur placeholders

---

## File Structure After Implementation

```
src/
├── app/
│   ├── api/
│   │   └── profile/
│   │       ├── route.ts (existing)
│   │       ├── picture/
│   │       │   └── route.ts (GET current picture)
│   │       ├── upload-picture/
│   │       │   └── route.ts (POST upload)
│   │       └── delete-picture/
│   │           └── route.ts (DELETE)
│   └── providers.tsx (updated)
├── components/
│   ├── ProfileAvatar.tsx (new)
│   └── ProfilePictureUpload.tsx (new)
├── contexts/
│   └── ProfilePictureContext.tsx (new)
└── lib/
    └── imageProcessing.ts (new - optional)
```

---

## API Reference

### GET /api/profile/picture

Returns the current user's profile picture URL.

**Response:**
```json
{
  "photoUrl": "https://..." | null
}
```

### POST /api/profile/upload-picture

Uploads a new profile picture.

**Request:** `multipart/form-data` with `file` field

**Success Response (200):**
```json
{
  "success": true,
  "photoUrl": "https://..."
}
```

**Error Responses:**
- `400`: Invalid file (type, size, dimensions)
- `401`: Unauthorized
- `500`: Server error

### DELETE /api/profile/delete-picture

Removes the current profile picture.

**Success Response (200):**
```json
{
  "success": true
}
```

**Error Responses:**
- `401`: Unauthorized
- `500`: Server error

---

## Estimated Implementation Time

| Task | Time |
|------|------|
| Infrastructure setup | 1 hour |
| API endpoints | 3 hours |
| Context & components | 3 hours |
| Integration | 2 hours |
| Testing | 2 hours |
| Polish | 2 hours |
| **Total** | **~13 hours** |

---

## Future Enhancements

1. **Image cropping** - Allow users to crop/zoom their photo before upload
2. **Multiple profile pictures** - Photo gallery feature
3. **AI moderation** - Automatic content moderation for inappropriate images
4. **Social media import** - Pull profile picture from linked social accounts
5. **Avatar generation** - Generate cartoon/stylized avatars
