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

    if (!reportedUserId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: reportedUserId and reason' },
        { status: 400 },
      );
    }

    const reportedUserIdNum = Number(reportedUserId);

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

    // Check if this user already reported this target
    const existingFlag = await prisma.flag.findFirst({
      where: {
        reported_by_user_id: reporterId,
        reported_user_id: reportedUserIdNum,
      },
    });

    if (existingFlag) {
      return NextResponse.json(
        { error: 'You have already reported this user' },
        { status: 409 },
      );
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
