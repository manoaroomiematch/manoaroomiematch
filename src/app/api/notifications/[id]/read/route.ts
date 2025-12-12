/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * PATCH /api/notifications/[id]/read
 * Marks a notification as read
 * Authentication required
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const userId = parseInt(session.user.id as string, 10);
    const notificationId = parseInt(params.id, 10);

    if (Number.isNaN(notificationId) || notificationId <= 0) {
      return NextResponse.json(
        { error: 'Invalid notification ID' },
        { status: 400 },
      );
    }

    // Verify the notification belongs to the current user
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

    if (notification.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You cannot modify this notification' },
        { status: 403 },
      );
    }

    // Mark as read
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedNotification = await (prisma as any).notification.update({
      where: { id: notificationId },
      data: { is_read: true },
    });

    return NextResponse.json({
      message: 'Notification marked as read',
      notification: {
        id: updatedNotification.id,
        type: updatedNotification.type,
        content: updatedNotification.content,
        is_read: updatedNotification.is_read,
        created_at: updatedNotification.created_at.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
