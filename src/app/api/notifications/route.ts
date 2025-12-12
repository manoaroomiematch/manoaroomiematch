/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * GET /api/notifications
 * Retrieves all notifications for the current user
 * Authentication required
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const userId = parseInt(session.user.id as string, 10);

    // Fetch notifications for the current user, ordered by most recent first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notifications = await (prisma as any).notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20, // Limit to 20 most recent notifications
    });

    return NextResponse.json({
      notifications: notifications.map((n: any) => ({
        id: n.id,
        type: n.type,
        content: n.content,
        is_read: n.is_read,
        created_at: n.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
