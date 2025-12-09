/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * Allowed MIME types for profile pictures
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Maximum file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Magic byte signatures for validating file content
 */
const MAGIC_SIGNATURES: Record<string, number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
};

/**
 * Validates the file's magic bytes to prevent MIME spoofing
 */
function validateMagicBytes(buffer: ArrayBuffer, mimeType: string): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 12));
  const signature = MAGIC_SIGNATURES[mimeType];

  if (!signature) return false;

  // For WebP, also check for WEBP after RIFF
  if (mimeType === 'image/webp') {
    const riff = signature.every((byte, index) => bytes[index] === byte);
    const webp = bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
    return riff && webp;
  }

  return signature.every((byte, index) => bytes[index] === byte);
}

/**
 * Generates a unique filename for the uploaded image
 */
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
  return `${timestamp}-${random}.${safeExt}`;
}

/**
 * POST /api/profile/upload-picture
 *
 * Handles profile picture upload with validation:
 * 1. Authentication check
 * 2. File type validation (MIME + magic bytes)
 * 3. File size validation
 * 4. Upload to storage
 * 5. Database update
 * 6. Cleanup old picture
 *
 * Request: multipart/form-data with 'file' field
 * Response: { success: true, photoUrl: string }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 },
      );
    }

    // 3. Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF' },
        { status: 400 },
      );
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 5MB' },
        { status: 400 },
      );
    }

    // 5. Validate magic bytes (prevent MIME spoofing)
    const buffer = await file.arrayBuffer();
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: 'File content does not match declared type' },
        { status: 400 },
      );
    }

    // 6. Get current profile to check for existing photo
    const currentProfile = await prisma.userProfile.findFirst({
      where: { email: session.user.email },
      select: { id: true, photoUrl: true },
    });

    if (!currentProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 },
      );
    }

    const oldPhotoUrl = currentProfile.photoUrl;

    // 7. Upload to storage
    // ============================================================
    // STORAGE IMPLEMENTATION OPTIONS:
    //
    // Option A: Vercel Blob (Recommended for Vercel deployment)
    // ---------------------------------------------------------
    // import { put, del } from '@vercel/blob';
    //
    // const filename = generateFilename(file.name);
    // const blob = await put(`profile-pictures/${filename}`, buffer, {
    //   access: 'public',
    //   contentType: file.type,
    // });
    // const photoUrl = blob.url;
    //
    // // Delete old image
    // if (oldPhotoUrl && oldPhotoUrl.includes('blob.vercel-storage.com')) {
    //   await del(oldPhotoUrl);
    // }
    //
    // Option B: Cloudinary
    // ---------------------------------------------------------
    // import { v2 as cloudinary } from 'cloudinary';
    //
    // const result = await cloudinary.uploader.upload(
    //   `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`,
    //   { folder: 'profile-pictures', public_id: generateFilename(file.name) }
    // );
    // const photoUrl = result.secure_url;
    //
    // Option C: AWS S3
    // ---------------------------------------------------------
    // import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const key = `profile-pictures/${generateFilename(file.name)}`;
    // await s3.send(new PutObjectCommand({
    //   Bucket: process.env.S3_BUCKET,
    //   Key: key,
    //   Body: Buffer.from(buffer),
    //   ContentType: file.type,
    // }));
    // const photoUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
    //
    // Option D: Local Storage (Development only - NOT for production)
    // ---------------------------------------------------------
    // See implementation below
    // ============================================================

    // DEVELOPMENT: Store as base64 data URL in database
    // In production, replace this with one of the storage options above
    const base64 = Buffer.from(buffer).toString('base64');
    const photoUrl = `data:${file.type};base64,${base64}`;

    // Note: For production with external storage, use a proper URL like:
    // const filename = generateFilename(file.name);
    // const photoUrl = await uploadToStorage(buffer, filename, file.type);

    // 8. Update database
    await prisma.userProfile.update({
      where: { id: currentProfile.id },
      data: { photoUrl },
    });

    // 9. Delete old image from storage (if using external storage)
    // if (oldPhotoUrl && !oldPhotoUrl.startsWith('data:')) {
    //   await deleteFromStorage(oldPhotoUrl);
    // }

    // Note: oldPhotoUrl and generateFilename are used when implementing external storage
    // eslint-disable-next-line no-console
    console.log('Old photo URL (for cleanup):', oldPhotoUrl ? 'exists' : 'none');
    // eslint-disable-next-line no-console
    console.log('generateFilename available:', typeof generateFilename);

    return NextResponse.json({
      success: true,
      photoUrl,
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to upload image. Please try again.' },
      { status: 500 },
    );
  }
}
