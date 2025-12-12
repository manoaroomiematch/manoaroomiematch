/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * POST /api/admin/user-role
 * Update a user's role (ADMIN or USER)
 * Admin-only endpoint
 * Prevents demoting the last admin
 */
export async function POST(req: Request) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    // Check if user has admin role
    if (session.user.randomKey !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { userId, newRole } = body;

    // Validate userId
    const userIdNum = Number(userId);
    if (Number.isNaN(userIdNum) || userIdNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid userId: must be a positive integer' },
        { status: 400 },
      );
    }

    // Validate newRole
    if (!['USER', 'ADMIN'].includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role: must be USER or ADMIN' },
        { status: 400 },
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userIdNum },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // Prevent demoting the last admin
    if (newRole === 'USER' && user.role === 'ADMIN') {
      // Count how many ADMIN users exist
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const adminCount = await (prisma as any).user.count({
        where: { role: 'ADMIN' },
      });

      if (adminCount === 1) {
        return NextResponse.json(
          { error: 'Cannot demote the last admin. There must be at least one admin in the system.' },
          { status: 400 },
        );
      }
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userIdNum },
      data: { role: newRole },
    });

    return NextResponse.json({
      message: `User role updated to ${newRole}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
