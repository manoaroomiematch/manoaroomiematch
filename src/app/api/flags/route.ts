/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * POST /api/flags
 * Creates a content moderation flag for reporting a user
 * Prevents duplicate flags from the same reporter for the same user
 */
export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    const reporterId = Number(session.user.id);

    // Parse request body
    const body = await req.json();
    const { reportedUserId, reason } = body;

    // Validate required fields
    if (!reportedUserId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: reportedUserId and reason' },
        { status: 400 },
      );
    }

    // Validate reportedUserId is a valid number
    const reportedUserIdNum = Number(reportedUserId);
    if (Number.isNaN(reportedUserIdNum) || reportedUserIdNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid reportedUserId: must be a positive integer' },
        { status: 400 },
      );
    }

    // Validate reason is not empty
    if (typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json(
        { error: 'Invalid reason: must be a non-empty string' },
        { status: 400 },
      );
    }

    // Prevent self-reporting
    if (reporterId === reportedUserIdNum) {
      return NextResponse.json(
        { error: 'You cannot report yourself' },
        { status: 400 },
      );
    }

    // Check if reported user exists
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserIdNum },
    });

    if (!reportedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // Check if this user already reported this target (only for regular users)
    // Admins can file multiple reports to track repeat offenses
    const isAdmin = session.user.randomKey === 'ADMIN';

    if (!isAdmin) {
      // Only block if there's a PENDING report, not if it's resolved
      const pendingFlag = await prisma.flag.findFirst({
        where: {
          reported_by_user_id: reporterId,
          reported_user_id: reportedUserIdNum,
          status: 'pending',
        },
      });

      if (pendingFlag) {
        return NextResponse.json(
          { error: 'You have a pending report for this user. Please wait for the moderation team to review it.' },
          { status: 409 },
        );
      }
    }

    // Create the flag
    const flag = await prisma.flag.create({
      data: {
        reported_by_user_id: reporterId,
        reported_user_id: reportedUserIdNum,
        reason,
        status: 'pending',
      },
    });

    return NextResponse.json(
      { message: 'Report submitted successfully', flag },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating flag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
