/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * GET /api/admin/moderation-history
 * Fetches moderation action history for a specific user (admin-only endpoint)
 * Query params: userId (required) - the ID of the user to fetch history for
 * Returns: Array of ModerationAction records sorted by creation date (newest first)
 */
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    if (session.user.randomKey !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 },
      );
    }

    // Get userId from query params
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: userId' },
        { status: 400 },
      );
    }

    const userIdInt = parseInt(userId, 10);

    // Fetch moderation history for the user
    const history = await prisma.moderationAction.findMany({
      where: { targetUserId: userIdInt },
      orderBy: { createdAt: 'desc' },
      include: {
        adminUser: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      history: history.map((action) => {
        const firstName = action.adminUser.profile?.firstName || '';
        const lastName = action.adminUser.profile?.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        return {
          id: action.id,
          action: action.action,
          durationHours: action.durationHours,
          notes: action.notes,
          date: action.createdAt.toISOString().split('T')[0],
          flagId: action.flagId,
          adminName: fullName || action.adminUser.email,
        };
      }),
      totalActions: history.length,
    });
  } catch (error) {
    console.error('Error fetching moderation history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
