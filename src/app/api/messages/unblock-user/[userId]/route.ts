/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * POST /api/messages/unblock-user/[userId]
 * Unblocks a user, allowing them to send messages again
 * Authenticated users only
 */
export async function POST(
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

    // Get current user's profile to update blocked users list
    const profile = await prisma.userProfile.findUnique({
      where: { userId: blockerId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 },
      );
    }

    // Parse existing blockedUsers from preferences
    const preferences = (profile.preferences as any) || {};
    const blockedUsersArray = Array.isArray(preferences.blockedUsers) ? preferences.blockedUsers : [];

    // Remove blocked user from list
    const updatedBlockedUsers = blockedUsersArray.filter((id: number) => id !== blockedUserId);

    // Update preferences with new blocked users list
    const updatedPreferences = { ...preferences, blockedUsers: updatedBlockedUsers };

    // Update the profile
    await prisma.userProfile.update({
      where: { userId: blockerId },
      data: {
        preferences: updatedPreferences,
      },
    });

    return NextResponse.json(
      { success: true, message: 'User unblocked', blockedUsers: updatedBlockedUsers },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
