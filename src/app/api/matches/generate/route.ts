/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import {
  generateMatchesForUser,
  regenerateMatchesForUser,
  generateAllMatches,
  deleteMatchesForUser,
  getMatchStats,
} from '@/lib/matchGeneration';

/**
 * POST /api/matches/generate
 *
 * Generates or regenerates matches for users.
 *
 * Request body options:
 *
 * 1. Generate for current user:
 *    { action: 'generate' }
 *
 * 2. Regenerate for current user:
 *    { action: 'regenerate' }
 *
 * 3. Generate for all users (ADMIN only):
 *    { action: 'generate-all' }
 *
 * 4. Delete matches for current user:
 *    { action: 'delete' }
 *
 * 5. Get match statistics:
 *    { action: 'stats' }
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 },
      );
    }

    // Get current user from database
    const { prisma } = await import('@/lib/prisma');
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // Handle different actions
    switch (action) {
      case 'generate': {
        // Generate matches for current user
        const matchIds = await generateMatchesForUser(currentUser.id);
        const stats = await getMatchStats(currentUser.id);

        return NextResponse.json({
          success: true,
          message: `Generated ${matchIds.length} new matches`,
          matchesCreated: matchIds.length,
          stats,
        });
      }

      case 'regenerate': {
        // Regenerate existing matches for current user
        const updatedCount = await regenerateMatchesForUser(currentUser.id);
        const stats = await getMatchStats(currentUser.id);

        return NextResponse.json({
          success: true,
          message: `Updated ${updatedCount} matches`,
          matchesUpdated: updatedCount,
          stats,
        });
      }

      case 'generate-all': {
        // Admin only - generate matches for all users
        const userWithRole = session.user as { email: string; randomKey: string };
        if (userWithRole.randomKey !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 },
          );
        }

        const result = await generateAllMatches();

        return NextResponse.json({
          success: true,
          message: 'Batch match generation complete',
          ...result,
        });
      }

      case 'delete': {
        // Delete all matches for current user
        const deletedCount = await deleteMatchesForUser(currentUser.id);

        return NextResponse.json({
          success: true,
          message: `Deleted ${deletedCount} matches`,
          matchesDeleted: deletedCount,
        });
      }

      case 'stats': {
        // Get match statistics for current user
        const stats = await getMatchStats(currentUser.id);

        return NextResponse.json({
          success: true,
          stats,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Error in match generation:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
