/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * DELETE /api/profile/delete-picture
 *
 * Removes the current user's profile picture.
 * 1. Authenticates the user
 * 2. Deletes image from storage (if using external storage)
 * 3. Sets photoUrl to null in database
 */
export async function DELETE() {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get current profile
    const profile = await prisma.userProfile.findFirst({
      where: { email: session.user.email },
      select: { id: true, photoUrl: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 },
      );
    }

    // 3. Delete from external storage if applicable
    // ============================================================
    // STORAGE DELETION OPTIONS:
    //
    // Option A: Vercel Blob
    // ---------------------------------------------------------
    // import { del } from '@vercel/blob';
    // if (profile.photoUrl && profile.photoUrl.includes('blob.vercel-storage.com')) {
    //   await del(profile.photoUrl);
    // }
    //
    // Option B: Cloudinary
    // ---------------------------------------------------------
    // import { v2 as cloudinary } from 'cloudinary';
    // const publicId = extractPublicIdFromUrl(profile.photoUrl);
    // await cloudinary.uploader.destroy(publicId);
    //
    // Option C: AWS S3
    // ---------------------------------------------------------
    // import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // const key = extractKeyFromUrl(profile.photoUrl);
    // await s3.send(new DeleteObjectCommand({
    //   Bucket: process.env.S3_BUCKET,
    //   Key: key,
    // }));
    // ============================================================

    // 4. Update database - set photoUrl to null
    await prisma.userProfile.update({
      where: { id: profile.id },
      data: { photoUrl: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to delete image. Please try again.' },
      { status: 500 },
    );
  }
}
