/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * GET /api/admin/users
 * Returns paginated users with their profile information
 * Query parameters: ?page=1&limit=10
 * Admin-only endpoint
 */
export async function GET(req: Request) {
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

    // Parse pagination parameters from URL
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.user.count();

    // Fetch paginated users with their profiles in one query for better efficiency
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        id: 'asc',
      },
      skip,
      take: limit,
    });

    // Transform the data to match the expected format for the admin UI
    // Falls back to email username if no profile exists
    const formattedUsers = users.map((user) => {
      const profileName = user.profile?.firstName && user.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
        : user.profile?.name || user.email.split('@')[0];

      return {
        id: user.id.toString(),
        name: profileName,
        email: user.email,
        role: user.role,
      };
    });

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
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

    // Delete all related records in correct order to avoid foreign key constraint violations
    try {
      // First, get the user's profile ID to delete matches
      const userProfile = await prisma.userProfile.findUnique({ where: { userId } });

      if (userProfile) {
        // Delete all matches for this user profile
        await prisma.match.deleteMany({
          where: {
            OR: [
              { user1Id: userProfile.id },
              { user2Id: userProfile.id },
            ],
          },
        });

        // Delete lifestyle responses before deleting profile
        await prisma.lifestyleResponse.deleteMany({ where: { user_id: userId } });

        // Delete the user profile
        await prisma.userProfile.delete({ where: { userId } });
      }

      // Delete all flags related to this user (both reported and reported_by)
      await prisma.flag.deleteMany({
        where: {
          OR: [
            { reported_by_user_id: userId },
            { reported_user_id: userId },
          ],
        },
      });

      // Delete all notifications for this user
      await prisma.notification.deleteMany({ where: { user_id: userId } });

      // Delete all messages where user is sender or receiver
      await prisma.message.deleteMany({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
      });
    } catch (err) {
      console.error('Error deleting related records:', err);
      return NextResponse.json(
        { error: `Failed to delete user records: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 500 },
      );
    }

    // Finally, delete the user
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}
