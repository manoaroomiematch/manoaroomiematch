/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * GET /api/admin/users
 * Returns all users with their profile information
 * Admin-only endpoint
 */
export async function GET() {
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

    // Fetch all users from the User table (which always exists)
    const users = await prisma.user.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    // Try to fetch profiles if the UserProfile table exists
    // This is a defensive approach since the table might not exist yet in all environments
    let profiles: any[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profiles = await (prisma as any).userProfile.findMany();
    } catch (err) {
      console.log('UserProfile table does not exist yet, using basic user info');
    }

    // Create a profile map for quick lookup by userId
    const profileMap = new Map(profiles.map((p: any) => [p.userId, p]));

    // Transform the data to match the expected format for the admin UI
    // Falls back to email username if no profile exists
    const formattedUsers = users.map((user) => {
      const profile = profileMap.get(user.id);
      return {
        id: user.id.toString(),
        name: profile?.name || user.email.split('@')[0], // Use email prefix as fallback
        email: user.email,
        role: user.role,
        activity: 'Online', // You can implement real activity tracking later
        createdAt: profile?.createdAt,
      };
    });

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/users
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
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid user id' }, { status: 400 });
    }

    const userId = Number(id);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user id format' }, { status: 400 });
    }

    // Delete user profile first using userId: Number(id)
    try {
      await (prisma as any).userProfile.delete({ where: { userId } });
    } catch (err) {
      // Ignore if profile doesn't exist
    }
    // Delete user from database
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
