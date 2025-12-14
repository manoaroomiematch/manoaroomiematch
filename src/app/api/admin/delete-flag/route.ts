import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line import/prefer-default-export
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || !session.user || session.user.randomKey !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { flagId } = await request.json();

    if (!flagId) {
      return NextResponse.json({ error: 'Flag ID is required' }, { status: 400 });
    }

    // Delete the flag
    await prisma.flag.delete({
      where: { id: flagId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting flag:', error);
    return NextResponse.json({ error: 'Failed to delete flag' }, { status: 500 });
  }
}
