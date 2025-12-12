/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * GET /api/reports/status
 * Get the status of reports submitted by the current user
 * Returns report status for tracking purposes
 */
export async function GET() {
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

    // Get all reports submitted by this user
    const reports = await prisma.flag.findMany({
      where: {
        reported_by_user_id: reporterId,
      },
      select: {
        id: true,
        reported_user_id: true,
        reported_user: {
          select: {
            profile: {
              select: {
                name: true,
              },
            },
          },
        },
        reason: true,
        status: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Map to user-friendly format
    const userReports = reports.map((report) => ({
      id: report.id,
      reportedUserId: report.reported_user_id,
      reportedUserName: report.reported_user?.profile?.name || 'Unknown User',
      reason: report.reason,
      status: report.status,
      createdAt: report.created_at,
    }));

    return NextResponse.json(
      { reports: userReports },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error fetching report status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
