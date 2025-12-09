/**
 * Image Processing Utilities
 *
 * Helper functions for validating and processing profile pictures.
 * These are used by the upload API endpoint for security and optimization.
 */

/**
 * Allowed MIME types for profile pictures
 */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Minimum image dimensions
 */
export const MIN_DIMENSION = 100;

/**
 * Maximum image dimensions
 */
export const MAX_DIMENSION = 4096;

/**
 * Magic byte signatures for validating file content
 * This prevents MIME type spoofing attacks
 */
export const MAGIC_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header (WebP specific check below)
};

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates MIME type against allowed types
 */
export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType);
}

/**
 * Validates file size
 */
export function validateFileSize(size: number): ValidationResult {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }
  return { valid: true };
}

/**
 * Validates magic bytes to prevent MIME type spoofing
 * @param buffer - The file's ArrayBuffer
 * @param declaredMimeType - The MIME type declared in the request
 */
export function validateMagicBytes(
  buffer: ArrayBuffer,
  declaredMimeType: string,
): ValidationResult {
  const bytes = new Uint8Array(buffer.slice(0, 12));
  const signature = MAGIC_SIGNATURES[declaredMimeType];

  if (!signature) {
    return { valid: false, error: 'Unsupported file type' };
  }

  // Basic signature check
  const matchesSignature = signature.every((byte, index) => bytes[index] === byte);

  if (!matchesSignature) {
    return { valid: false, error: 'File content does not match declared type' };
  }

  // Additional WebP validation (check for WEBP after RIFF)
  if (declaredMimeType === 'image/webp') {
    const webpMarker = bytes[8] === 0x57 // W
      && bytes[9] === 0x45 // E
      && bytes[10] === 0x42 // B
      && bytes[11] === 0x50; // P
    if (!webpMarker) {
      return { valid: false, error: 'Invalid WebP file' };
    }
  }

  return { valid: true };
}

/**
 * Generates a unique, safe filename for storage
 * @param originalName - Original filename
 * @param userId - User ID for namespacing
 */
export function generateSafeFilename(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  // Extract and validate extension
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';

  // Sanitize userId to prevent path traversal
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');

  return `${safeUserId}/${timestamp}-${random}.${safeExt}`;
}

/**
 * Extracts file extension from MIME type
 */
export function mimeToExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mimeType] || 'jpg';
}

/**
 * Validates all aspects of an uploaded file
 * This is the main validation function used by the upload endpoint
 */
export async function validateImageUpload(file: File): Promise<ValidationResult> {
  // Check file exists
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No file provided' };
  }

  // Check MIME type
  if (!isAllowedMimeType(file.type)) {
    return { valid: false, error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF' };
  }

  // Check file size
  const sizeResult = validateFileSize(file.size);
  if (!sizeResult.valid) {
    return sizeResult;
  }

  // Check magic bytes
  const buffer = await file.arrayBuffer();
  const magicResult = validateMagicBytes(buffer, file.type);
  if (!magicResult.valid) {
    return magicResult;
  }

  return { valid: true };
}

/**
 * Storage provider interface
 * Implement this interface for different storage backends
 */
export interface StorageProvider {
  upload(buffer: ArrayBuffer, filename: string, mimeType: string): Promise<string>;
  delete(url: string): Promise<void>;
}

/**
 * Example storage provider implementations (for reference)
 *
 * // Vercel Blob
 * import { put, del } from '@vercel/blob';
 *
 * const vercelBlobProvider: StorageProvider = {
 *   async upload(buffer, filename, mimeType) {
 *     const blob = await put(`profile-pictures/${filename}`, buffer, {
 *       access: 'public',
 *       contentType: mimeType,
 *     });
 *     return blob.url;
 *   },
 *   async delete(url) {
 *     await del(url);
 *   },
 * };
 *
 * // Cloudinary
 * import { v2 as cloudinary } from 'cloudinary';
 *
 * const cloudinaryProvider: StorageProvider = {
 *   async upload(buffer, filename, mimeType) {
 *     const base64 = Buffer.from(buffer).toString('base64');
 *     const result = await cloudinary.uploader.upload(
 *       `data:${mimeType};base64,${base64}`,
 *       { folder: 'profile-pictures', public_id: filename }
 *     );
 *     return result.secure_url;
 *   },
 *   async delete(url) {
 *     const publicId = extractPublicIdFromUrl(url);
 *     await cloudinary.uploader.destroy(publicId);
 *   },
 * };
 *
 * // AWS S3
 * import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
 *
 * const s3 = new S3Client({ region: process.env.AWS_REGION });
 * const bucket = process.env.S3_BUCKET;
 *
 * const s3Provider: StorageProvider = {
 *   async upload(buffer, filename, mimeType) {
 *     const key = `profile-pictures/${filename}`;
 *     await s3.send(new PutObjectCommand({
 *       Bucket: bucket,
 *       Key: key,
 *       Body: Buffer.from(buffer),
 *       ContentType: mimeType,
 *     }));
 *     return `https://${bucket}.s3.amazonaws.com/${key}`;
 *   },
 *   async delete(url) {
 *     const key = extractKeyFromUrl(url);
 *     await s3.send(new DeleteObjectCommand({
 *       Bucket: bucket,
 *       Key: key,
 *     }));
 *   },
 * };
 */
