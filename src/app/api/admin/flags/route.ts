/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * GET /api/admin/flags
 * Returns paginated content moderation flags
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
    let total = 0;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      total = await (prisma as any).flag.count();
    } catch (err) {
      console.log('Flag table count failed:', err);
      return NextResponse.json({
        flags: [],
        pagination: { total: 0, page, limit, pages: 0 },
      });
    }

    // Fetch paginated flags with user information
    // Wrapped in try-catch to handle cases where Flag table doesn't exist yet
    let flags: any[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      flags = await (prisma as any).flag.findMany({
        include: {
          reported_user: true,
          reported_by_user: true,
        },
        orderBy: {
          created_at: 'desc',
        },
        skip,
        take: limit,
      });
    } catch (err) {
      console.log('Flag table query failed, returning empty list:', err);
      return NextResponse.json({
        flags: [],
        pagination: { total: 0, page, limit, pages: 0 },
      });
    }

    // Fetch all users to get their basic information (email, role)
    const users = await prisma.user.findMany();
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Try to get profiles if UserProfile table exists
    // This allows displaying user names instead of just emails
    let profiles: any[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      profiles = await (prisma as any).userProfile.findMany();
    } catch (err) {
      console.log('UserProfile table does not exist, using user emails');
    }
    const profileMap = new Map(profiles.map((p: any) => [p.userId, p]));

    // Transform the data to match the expected format for the admin UI
    // Uses profile names if available, falls back to email, then 'Unknown User'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedFlags = flags.map((flag: any) => {
      const reportedUser = userMap.get(flag.reported_user_id);
      const reportedByUser = userMap.get(flag.reported_by_user_id);
      const reportedProfile = profileMap.get(flag.reported_user_id);
      const reportedByProfile = profileMap.get(flag.reported_by_user_id);

      return {
        id: flag.id,
        user: reportedProfile?.name || reportedUser?.email || 'Unknown User',
        reportedBy: reportedByProfile?.name || reportedByUser?.email || 'Unknown User',
        reason: flag.reason,
        status: flag.status,
        date: flag.created_at.toISOString().split('T')[0],
        createdAt: flag.created_at,
      };
    });

    return NextResponse.json({
      flags: formattedFlags,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching flags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
