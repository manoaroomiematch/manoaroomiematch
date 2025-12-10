/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * POST /api/admin/resolve-flag
 * Resolves, suspends, deactivates, or reactivates a user based on a content moderation flag
 * Admin-only endpoint - supports actions: 'resolve', 'suspend', 'deactivate', 'reactivate'
 * For 'suspend': requires durationHours parameter
 * Optional: notes field for all actions
 */
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    // Check if user has admin role (only admins can resolve flags)
    if (session.user.randomKey !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 },
      );
    }

    // Parse request body to get flag ID, action, duration, and notes
    const body = await req.json();
    const { flagId, action, durationHours, notes } = body;

    if (!flagId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: flagId and action' },
        { status: 400 },
      );
    }

    // Validate action parameter
    if (!['resolve', 'suspend', 'deactivate', 'reactivate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "resolve", "suspend", "deactivate", or "reactivate"' },
        { status: 400 },
      );
    }

    // Validate suspend action has duration
    if (action === 'suspend' && !durationHours) {
      return NextResponse.json(
        { error: 'Missing required field for suspend action: durationHours' },
        { status: 400 },
      );
    }

    // Check if flag exists in the database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flag = await (prisma as any).flag.findUnique({
      where: { id: parseInt(flagId, 10) },
    });

    if (!flag) {
      return NextResponse.json(
        { error: 'Flag not found' },
        { status: 404 },
      );
    }

    const adminUserId = session.user.id;
    const reportedUserId = flag.reported_user_id;

    // Handle 'resolve' action - marks the flag as resolved without affecting the user
    if (action === 'resolve') {
      // Update flag status to resolved
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedFlag = await (prisma as any).flag.update({
        where: { id: parseInt(flagId, 10) },
        data: { status: 'resolved' },
      });

      // Log the moderation action
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).moderationAction.create({
        data: {
          targetUserId: reportedUserId,
          adminUserId,
          action: 'resolve',
          notes: notes || null,
          flagId: parseInt(flagId, 10),
        },
      });

      return NextResponse.json({
        message: 'Flag resolved successfully',
        flag: updatedFlag,
      });
    }

    // Handle 'suspend' action - temporarily suspends user for specified duration
    if (action === 'suspend') {
      const suspendedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);

      // Update user suspension
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedUser = await (prisma as any).user.update({
        where: { id: reportedUserId },
        data: {
          suspendedUntil,
          suspensionCount: { increment: 1 },
        },
      });

      // Update flag status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedFlag = await (prisma as any).flag.update({
        where: { id: parseInt(flagId, 10) },
        data: { status: 'resolved' },
      });

      // Log the moderation action
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).moderationAction.create({
        data: {
          targetUserId: reportedUserId,
          adminUserId,
          action: 'suspend',
          durationHours,
          notes: notes || null,
          flagId: parseInt(flagId, 10),
        },
      });

      return NextResponse.json({
        message: `User suspended successfully for ${durationHours} hours`,
        user: updatedUser,
        flag: updatedFlag,
      });
    }

    // Handle 'deactivate' action - permanently deactivates user account
    if (action === 'deactivate') {
      // Update user to be inactive
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedUser = await (prisma as any).user.update({
        where: { id: reportedUserId },
        data: {
          active: false,
          suspendedUntil: null,
        },
      });

      // Update flag status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedFlag = await (prisma as any).flag.update({
        where: { id: parseInt(flagId, 10) },
        data: { status: 'user_deactivated' },
      });

      // Log the moderation action
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).moderationAction.create({
        data: {
          targetUserId: reportedUserId,
          adminUserId,
          action: 'deactivate',
          notes: notes || null,
          flagId: parseInt(flagId, 10),
        },
      });

      return NextResponse.json({
        message: 'User deactivated successfully',
        user: updatedUser,
        flag: updatedFlag,
      });
    }

    // Handle 'reactivate' action - reactivates a previously deactivated user
    if (action === 'reactivate') {
      // Update user to be active again
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedUser = await (prisma as any).user.update({
        where: { id: reportedUserId },
        data: {
          active: true,
          suspendedUntil: null,
        },
      });

      // Log the moderation action
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).moderationAction.create({
        data: {
          targetUserId: reportedUserId,
          adminUserId,
          action: 'reactivate',
          notes: notes || null,
        },
      });

      return NextResponse.json({
        message: 'User reactivated successfully',
        user: updatedUser,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Error resolving flag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
