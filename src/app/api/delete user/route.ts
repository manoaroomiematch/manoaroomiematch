import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Prisma } from '@prisma/client';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

// Route metadata to satisfy lint rules and Next.js expectations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const { email } = session.user as { email: string };

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }
    // Secure password check
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    // Delete related records (adjust as per schema relationships)
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Use the already-fetched user; find profile by userId
      const profile = await tx.userProfile.findUnique({ where: { userId: user.id } });
      if (profile) {
        // Collect match ids to delete AI explanations first
        const matches = await tx.match.findMany({ where: { OR: [{ user1Id: profile.id }, { user2Id: profile.id }] } });
        const matchIds = matches.map((mm) => mm.id);
        if (matchIds.length > 0) {
          await tx.aIExplanation.deleteMany({ where: { match_id: { in: matchIds } } });
        }
        await tx.match.deleteMany({ where: { OR: [{ user1Id: profile.id }, { user2Id: profile.id }] } });
        // Delete messages tied to user.id (number)
        await tx.message.deleteMany({ where: { OR: [{ senderId: user.id }, { receiverId: user.id }] } });
        await tx.userProfile.delete({ where: { id: profile.id } });
      }
      // Delete flags, notifications, lifestyle responses tied to user
      await tx.flag.deleteMany({ where: { OR: [{ reported_by_user_id: user.id }, { reported_user_id: user.id }] } });
      await tx.notification.deleteMany({ where: { user_id: user.id } });
      await tx.lifestyleResponse.deleteMany({ where: { user_id: user.id } });
      await tx.user.delete({ where: { email } });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Delete account error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
