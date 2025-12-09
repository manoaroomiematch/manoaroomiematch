/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * GET /api/profile/picture
 *
 * Returns the current user's profile picture URL.
 * Used by ProfilePictureContext to fetch the initial photo URL.
 */
export async function GET() {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch profile
    const profile = await prisma.userProfile.findFirst({
      where: { email: session.user.email },
      select: { photoUrl: true },
    });

    return NextResponse.json({
      photoUrl: profile?.photoUrl || null,
    });
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
