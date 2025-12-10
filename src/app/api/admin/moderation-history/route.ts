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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const history = await (prisma as any).moderationAction.findMany({
      where: { targetUserId: userIdInt },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        durationHours: true,
        notes: true,
        createdAt: true,
        flagId: true,
        adminUser: {
          select: {
            id: true,
            email: true,
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
      history,
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
