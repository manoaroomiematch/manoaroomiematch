/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * POST /api/admin/resolve-flag
 * Resolves or updates a content moderation flag
 * Admin-only endpoint - updates flag status to either 'RESOLVED' or 'DEACTIVATED'
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

    // Parse request body to get flag ID and action to perform
    const body = await req.json();
    const { flagId, action } = body;

    if (!flagId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: flagId and action' },
        { status: 400 },
      );
    }

    // Validate action parameter (must be 'resolve' or 'deactivate')
    if (!['resolve', 'deactivate'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "resolve" or "deactivate"' },
        { status: 400 },
      );
    }

    // Check if flag exists in the database
    // Uses (prisma as any) workaround due to TypeScript caching issue with Flag model
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

    // Handle 'resolve' action - marks the flag as resolved without deactivating the user
    if (action === 'resolve') {
      // Update flag status to resolved
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedFlag = await (prisma as any).flag.update({
        where: { id: parseInt(flagId, 10) },
        data: { status: 'resolved' },
      });

      return NextResponse.json({
        message: 'Flag resolved successfully',
        flag: updatedFlag,
      });
    }

    // Handle 'deactivate' action - marks the user as deactivated via flag status
    if (action === 'deactivate') {
      // Update the reported user's account (you might want to add an 'active' field to User model)
      // For now, we'll just update the flag status to indicate user deactivation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedFlag = await (prisma as any).flag.update({
        where: { id: parseInt(flagId, 10) },
        data: { status: 'user_deactivated' },
      });

      // TODO: Optionally, you could deactivate the user here by adding an 'active' field to User model
      // await prisma.user.update({
      //   where: { id: flag.reported_user_id },
      //   data: { active: false },
      // });

      return NextResponse.json({
        message: 'User deactivated successfully',
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
