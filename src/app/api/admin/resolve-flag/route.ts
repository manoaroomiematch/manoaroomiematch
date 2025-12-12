/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * Helper function to notify all reporters of a user that action has been taken
 * Sends notifications to all users who reported the specified user (excluding admins)
 */
async function notifyReporters(reportedUserId: number, actionType: string) {
  try {
    // Find all flags reported against this user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allFlags = await (prisma as any).flag.findMany({
      where: { reported_user_id: reportedUserId },
      select: { reported_by_user_id: true },
    });

    // Get unique reporter IDs, excluding admins
    const reporterIds = [...new Set(
      allFlags
        .map((f: any) => f.reported_by_user_id)
        .filter((id: number) => id), // Filter out null/undefined
    )];

    if (reporterIds.length === 0) return;

    // Fetch reporters to filter out admins
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reporters = await (prisma as any).user.findMany({
      where: { id: { in: reporterIds } },
      select: { id: true, role: true },
    });

    // Filter out admin reporters (admins don't need notifications for their own actions)
    const regularReporterIds = reporters
      .filter((r: any) => r.role !== 'ADMIN')
      .map((r: any) => r.id);

    if (regularReporterIds.length === 0) return;

    // Create notifications for each regular user reporter
    // eslint-disable-next-line no-nested-ternary
    const notificationText = actionType === 'suspend'
      ? 'Thank you for your report. We\'ve reviewed the case and taken appropriate action.'
      : actionType === 'deactivate'
        ? 'Thank you for your report. We\'ve reviewed the case and deactivated the user\'s account.'
        : 'Thank you for your report. We\'ve reviewed the case.';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).notification.createMany({
      data: regularReporterIds.map((reporterId: number) => ({
        user_id: reporterId,
        type: 'report_action',
        content: notificationText,
        is_read: false,
      })),
    });
  } catch (error) {
    // Log error but don't fail the main request
    console.error('Error notifying reporters:', error);
  }
}

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

    // Validate required fields
    if (!flagId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: flagId and action' },
        { status: 400 },
      );
    }

    // Validate flagId is a valid number
    const flagIdNum = parseInt(String(flagId), 10);
    if (Number.isNaN(flagIdNum) || flagIdNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid flagId: must be a positive integer' },
        { status: 400 },
      );
    }

    // Validate action parameter
    const validActions = ['resolve', 'suspend', 'unsuspend', 'deactivate', 'reactivate'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
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

    // Validate durationHours is valid if provided
    if (durationHours && (typeof durationHours !== 'number' || durationHours <= 0)) {
      return NextResponse.json(
        { error: 'Invalid durationHours: must be a positive number' },
        { status: 400 },
      );
    }

    // Check if flag exists in the database - CRITICAL SAFETY CHECK
    // This ensures we only modify users that have been explicitly reported
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flag = await (prisma as any).flag.findUnique({
      where: { id: flagIdNum },
    });

    if (!flag) {
      return NextResponse.json(
        { error: `Flag not found: No flag exists with ID ${flagIdNum}` },
        { status: 404 },
      );
    }

    // Additional safety check: verify the flag has a valid reported_user_id
    if (!flag.reported_user_id || flag.reported_user_id <= 0) {
      return NextResponse.json(
        { error: 'Flag has invalid reported user ID' },
        { status: 400 },
      );
    }

    const adminUserId = parseInt(session.user.id as string, 10);
    const reportedUserId = flag.reported_user_id;

    // Critical safety check: verify the reported user actually exists
    // This prevents moderation actions from affecting non-existent users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reportedUser = await (prisma as any).user.findUnique({
      where: { id: reportedUserId },
    });

    if (!reportedUser) {
      return NextResponse.json(
        { error: `Reported user not found: User ID ${reportedUserId} does not exist in the database` },
        { status: 404 },
      );
    }

    // Handle 'resolve' action - marks the flag as resolved without affecting the user
    if (action === 'resolve') {
      // Update flag status to resolved
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedFlag = await (prisma as any).flag.update({
        where: { id: flagIdNum },
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
          flagId: flagIdNum,
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
      const updatedUser = await (prisma as any).user.update({
        where: { id: reportedUserId },
        data: {
          suspendedUntil,
          suspensionCount: { increment: 1 },
        },
      });

      // Update flag status to 'suspended'
      const updatedFlag = await (prisma as any).flag.update({
        where: { id: flagIdNum },
        data: { status: 'suspended' },
      });

      // Log the moderation action
      await (prisma as any).moderationAction.create({
        data: {
          targetUserId: reportedUserId,
          adminUserId,
          action: 'suspend',
          durationHours,
          notes: notes || null,
          flagId: flagIdNum,
        },
      });

      // Notify all reporters that action was taken
      await notifyReporters(reportedUserId, 'suspend');

      return NextResponse.json({
        message: `User suspended successfully for ${durationHours} hours`,
        user: updatedUser,
        flag: updatedFlag,
      });
    }

    // Handle 'unsuspend' action - removes suspension from user
    if (action === 'unsuspend') {
      // Update user to remove suspension
      const updatedUser = await (prisma as any).user.update({
        where: { id: reportedUserId },
        data: {
          suspendedUntil: null,
        },
      });

      // Update flag status to resolved
      const updatedFlag = await (prisma as any).flag.update({
        where: { id: flagIdNum },
        data: { status: 'resolved' },
      });

      // Log the moderation action
      await (prisma as any).moderationAction.create({
        data: {
          targetUserId: reportedUserId,
          adminUserId,
          action: 'unsuspend',
          notes: notes || null,
          flagId: flagIdNum,
        },
      });

      return NextResponse.json({
        message: 'User unsuspended successfully',
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
        where: { id: flagIdNum },
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
          flagId: flagIdNum,
        },
      });

      // Notify all reporters that action was taken
      await notifyReporters(reportedUserId, 'deactivate');

      return NextResponse.json({
        message: 'User deactivated successfully',
        user: updatedUser,
        flag: updatedFlag,
      });
    }

    // Handle 'reactivate' action - reactivates a previously deactivated user
    if (action === 'reactivate') {
      // Update user to be active again
      const updatedUser = await (prisma as any).user.update({
        where: { id: reportedUserId },
        data: {
          active: true,
        },
      });

      // Update flag status to resolved
      const updatedFlag = await (prisma as any).flag.update({
        where: { id: flagIdNum },
        data: { status: 'resolved' },
      });

      // Log the moderation action
      await (prisma as any).moderationAction.create({
        data: {
          targetUserId: reportedUserId,
          adminUserId,
          action: 'reactivate',
          notes: notes || null,
          flagId: flagIdNum,
        },
      });

      return NextResponse.json({
        message: 'User reactivated successfully',
        user: updatedUser,
        flag: updatedFlag,
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
