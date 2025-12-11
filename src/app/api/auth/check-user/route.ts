/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { prisma } from '@/lib/prisma';

interface CheckUserRequest {
  email?: string;
  password?: string;
}

/**
 * POST /api/auth/check-user
 * Check if a user is suspended or deactivated WITHOUT attempting authentication
 * Used on sign-in page to show appropriate error message before attempting sign-in
 * Public endpoint - no authentication required
 */
export async function POST(req: NextRequest) {
  try {
    const body: CheckUserRequest = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 },
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // User not found - let sign-in page handle this
      return NextResponse.json({ status: 'valid' });
    }

    // Check password first
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      // Invalid password - let sign-in page handle this
      return NextResponse.json({ status: 'valid' });
    }

    // Check if deactivated
    if (!user.active) {
      // Fetch latest flag for reason
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const latestFlag = await (prisma as any).flag.findFirst({
        where: { reported_user_id: user.id },
        orderBy: { created_at: 'desc' },
        select: {
          reason: true,
          status: true,
          created_at: true,
        },
      });

      return NextResponse.json({
        status: 'deactivated',
        flag: latestFlag ? {
          reason: latestFlag.reason,
          status: latestFlag.status,
          createdAt: latestFlag.created_at.toISOString(),
        } : null,
      });
    }

    // Check if suspended
    if (user.suspendedUntil && user.suspendedUntil > new Date()) {
      // Fetch latest flag for reason
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const latestFlag = await (prisma as any).flag.findFirst({
        where: { reported_user_id: user.id },
        orderBy: { created_at: 'desc' },
        select: {
          reason: true,
          status: true,
          created_at: true,
        },
      });

      return NextResponse.json({
        status: 'suspended',
        suspendedUntil: user.suspendedUntil.toISOString(),
        flag: latestFlag ? {
          reason: latestFlag.reason,
          status: latestFlag.status,
          createdAt: latestFlag.created_at.toISOString(),
        } : null,
      });
    }

    // User is valid and not suspended/deactivated
    return NextResponse.json({ status: 'valid' });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
