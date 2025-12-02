/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * DELETE /api/admin/users/delete
 * Deletes a user by ID (admin only)
 * Expects JSON body: { id: string }
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.randomKey !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    // Delete user from database (convert id to Int)
    await prisma.user.delete({ where: { id: Number(id) } });
    // Optionally delete related profile, etc.
    try {
      await (prisma as any).userProfile.delete({ where: { userId: id } });
    } catch (err) {
      // Ignore if profile doesn't exist
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
