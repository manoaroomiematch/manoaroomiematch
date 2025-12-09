'use client';

import { useState, useRef, useCallback } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import { Upload, Trash, PersonCircle, Camera } from 'react-bootstrap-icons';
import Image from 'next/image';
import { useProfilePicture } from '@/contexts/ProfilePictureContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * ProfilePictureUpload Component
 *
 * A complete profile picture upload UI with:
 * - Drag and drop support
 * - Click to upload
 * - Preview before upload completes
 * - Loading states
 * - Error handling
 * - Delete functionality
 *
 * Integrates with ProfilePictureContext for real-time updates across the app.
 */
export default function ProfilePictureUpload() {
  const { photoUrl, isLoading, uploadPicture, deletePicture } = useProfilePicture();
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Validates a file before upload
   */
  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a JPG, PNG, WebP, or GIF image';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image must be less than 5MB';
    }
    return null;
  };

  /**
   * Handles file selection and upload
   */
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Client-side validation
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Show preview immediately for better UX
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);

      // Upload to server
      const result = await uploadPicture(file);

      if (!result.success) {
        setError(result.error || 'Upload failed. Please try again.');
        setPreview(null);
      } else {
        // Clear preview - the context now has the real URL
        setPreview(null);
      }
    },
    [uploadPicture],
  );

  /**
   * Handle drag events for drag-and-drop
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  /**
   * Handle file drop
   */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile],
  );

  /**
   * Handle file input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  /**
   * Handle delete button click
   */
  const handleDelete = async () => {
    setError(null);
    const result = await deletePicture();
    if (!result.success) {
      setError(result.error || 'Failed to remove photo. Please try again.');
    }
  };

  /**
   * Trigger file input click
   */
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Show preview during upload, otherwise show actual photo
  const displayUrl = preview || photoUrl;

  return (
    <div className="text-center">
      {/* Profile Picture Display / Drop Zone */}
      <div
        className={`position-relative mx-auto mb-3 ${
          dragActive ? 'drag-active' : ''
        }`}
        style={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          border: dragActive ? '3px dashed #0d6efd' : '3px solid #dee2e6',
          overflow: 'hidden',
          cursor: isLoading ? 'default' : 'pointer',
          backgroundColor: '#f8f9fa',
          transition: 'border-color 0.2s ease',
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isLoading ? triggerFileSelect : undefined}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
            triggerFileSelect();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={displayUrl ? 'Change profile picture' : 'Upload profile picture'}
      >
        {/* Image or Placeholder */}
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="Profile"
            fill
            style={{ objectFit: 'cover' }}
            unoptimized={displayUrl.startsWith('data:')}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100">
            <PersonCircle size={80} className="text-secondary" />
          </div>
        )}

        {/* Hover Overlay */}
        {!isLoading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              opacity: isHovering ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <Camera size={32} className="text-white" />
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
          >
            <Spinner animation="border" variant="primary" />
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleChange}
        className="d-none"
        aria-hidden="true"
      />

      {/* Action Buttons */}
      <div className="d-flex justify-content-center gap-2 mb-2">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={triggerFileSelect}
          disabled={isLoading}
        >
          <Upload className="me-1" />
          {photoUrl ? 'Change Photo' : 'Upload Photo'}
        </Button>

        {photoUrl && !preview && (
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

      {/* Helper Text */}
      <small className="text-muted d-block">
        Drag & drop or click to upload
        <br />
        JPG, PNG, WebP, or GIF (max 5MB)
      </small>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" className="mt-3 py-2 mb-0">
          {error}
        </Alert>
      )}
    </div>
  );
}
