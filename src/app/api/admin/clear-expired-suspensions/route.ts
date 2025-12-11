/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/clear-expired-suspensions
 * Clears suspensions for users whose suspension period has expired
 * This endpoint is meant to be called by a scheduled job (cron) periodically
 * No authentication required for cron jobs, but ideally protected by API key
 */
export async function GET(req: NextRequest) {
  try {
    // Verify request is from a trusted source (e.g., cron job with API key)
    // SECURITY: Require the secret key to be set - if not set, endpoint is not protected
    const authHeader = req.headers.get('authorization');
    const expectedKey = process.env.CRON_SECRET_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      console.warn('Unauthorized cron job attempt - missing or invalid CRON_SECRET_KEY');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Find all users with suspensions that have expired
    const expiredSuspensions = await prisma.user.findMany({
      where: {
        suspendedUntil: {
          not: null,
          lt: new Date(), // suspendedUntil is in the past
        },
        active: true, // Only clear suspensions for active users
      },
      select: {
        id: true,
        email: true,
        suspendedUntil: true,
      },
    });

    if (expiredSuspensions.length === 0) {
      return NextResponse.json({
        message: 'No expired suspensions found',
        cleared: 0,
      });
    }

    // Clear suspension for all users with expired periods
    const clearResult = await prisma.user.updateMany({
      where: {
        suspendedUntil: {
          not: null,
          lt: new Date(),
        },
        active: true,
      },
      data: {
        suspendedUntil: null,
      },
    });

    console.log(`Cleared ${clearResult.count} expired suspensions`);

    return NextResponse.json({
      message: `Cleared ${clearResult.count} expired suspensions`,
      cleared: clearResult.count,
      clearedUsers: expiredSuspensions.map((user) => ({
        id: user.id,
        email: user.email,
        wasSuspendedUntil: user.suspendedUntil,
      })),
    });
  } catch (error) {
    console.error('Error clearing expired suspensions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
