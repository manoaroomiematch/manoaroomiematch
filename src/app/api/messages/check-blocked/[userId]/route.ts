/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * GET /api/messages/check-blocked/[userId]
 * Checks if a user is blocked by the current user
 * Authenticated users only
 */
export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    const blockerId = Number(session.user.id);
    const blockedUserId = Number(params.userId);

    if (Number.isNaN(blockedUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 },
      );
    }

    // Get current user's profile to check blocked users list
    const profile = await prisma.userProfile.findUnique({
      where: { userId: blockerId },
    });

    if (!profile) {
      return NextResponse.json(
        { isBlocked: false },
        { status: 200 },
      );
    }

    // Parse blockedUsers from preferences
    const preferences = (profile.preferences as any) || {};
    const blockedUsers = Array.isArray(preferences.blockedUsers) ? preferences.blockedUsers : [];

    const isBlocked = blockedUsers.includes(blockedUserId);

    return NextResponse.json(
      { isBlocked },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error checking block status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
