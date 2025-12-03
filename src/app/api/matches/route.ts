/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { getMatchesByUserId } from '@/lib/dbActions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);

    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user id in session' }, { status: 400 });
    }

    const profile = await prisma.userProfile.findUnique({ where: { userId } });

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const matches = await getMatchesByUserId(profile.id);

    return NextResponse.json({ matches, currentProfileId: profile.id });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
