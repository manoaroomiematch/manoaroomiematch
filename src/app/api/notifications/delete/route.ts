/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * DELETE /api/notifications/delete
 * Deletes a specific notification for the current user
 * Body: { notificationId: number }
 * Authentication required
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { notificationId } = await req.json();

    if (!notificationId || typeof notificationId !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid notificationId' },
        { status: 400 },
      );
    }

    const userId = parseInt(session.user.id as string, 10);

    // Verify the notification belongs to the current user (security check)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notification = await (prisma as any).notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 },
      );
    }

    // Ensure user can only delete their own notifications
    if (notification.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot delete other users\' notifications' },
        { status: 403 },
      );
    }

    // Delete the notification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
