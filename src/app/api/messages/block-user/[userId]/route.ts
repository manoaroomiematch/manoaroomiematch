/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * POST /api/messages/block-user/[userId]
 * Blocks a user from sending messages to the current user
 * Stores block list in the UserProfile metadata field
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

    if (blockerId === blockedUserId) {
      return NextResponse.json(
        { error: 'You cannot block yourself' },
        { status: 400 },
      );
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: blockedUserId },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
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

    // Parse existing blockedUsers from preferences or create new array
    const preferences = (profile.preferences as any) || {};
    const blockedUsersArray = Array.isArray(preferences.blockedUsers) ? preferences.blockedUsers : [];

    // Add blocked user if not already in list
    if (!blockedUsersArray.includes(blockedUserId)) {
      blockedUsersArray.push(blockedUserId);
    }

    // Update preferences with new blocked users list
    const updatedPreferences = { ...preferences, blockedUsers: blockedUsersArray };

    // Update the profile
    await prisma.userProfile.update({
      where: { userId: blockerId },
      data: {
        preferences: updatedPreferences,
      },
    });

    return NextResponse.json(
      { success: true, blockedUsers: blockedUsersArray },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
