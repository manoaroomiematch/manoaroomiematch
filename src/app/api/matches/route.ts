/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import authOptions from '@/lib/authOptions';

/**
 * GET /api/matches?sort=score
 *
 * Fetches all matches for the current authenticated user, sorted by compatibility score.
 *
 * Query Parameters:
 * - sort: 'score' (default) or 'date' - Sort by compatibility score or creation date
 * - order: 'desc' (default) or 'asc' - Sort order
 *
 * Returns:
 * - Array of matches with basic user info for each match partner
 * - Each match includes: id, name, major, traits, matchPercentage, photoUrl
 *
 * Authentication:
 * - Requires active session
 * - Returns 401 if not authenticated
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    // Get current user's profile
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!currentUser || !currentUser.profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 },
      );
    }

    const currentUserProfileId = currentUser.profile.id;

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sort') || 'score';
    const order = searchParams.get('order') || 'desc';

    // Fetch all matches for current user
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: currentUserProfileId },
          { user2Id: currentUserProfileId },
        ],
      },
      include: {
        user1: true,
        user2: true,
      },
    });

    // Transform matches to include only the match partner's info
    const formattedMatches = matches.map((match) => {
      // Determine which user is the match (not the current user)
      const isUser1 = match.user1Id === currentUserProfileId;
      const matchPartner = isUser1 ? match.user2 : match.user1;

      // Derive personality traits from lifestyle data
      const traits: string[] = [];
      if (matchPartner.sleepSchedule > 3) traits.push('Night Owl');
      else if (matchPartner.sleepSchedule < 3) traits.push('Early Bird');

      if (matchPartner.cleanliness > 3) traits.push('Tidy');
      if (matchPartner.socialLevel > 3) traits.push('Social');
      else if (matchPartner.socialLevel < 3) traits.push('Introvert');

      if (matchPartner.smoking) traits.push('Smoker');
      if (matchPartner.pets) traits.push('Pet Friendly');

      // Return formatted match data
      return {
        id: match.id,
        matchId: match.id, // For backwards compatibility
        name: matchPartner.name,
        traits: traits.length > 0 ? traits : ['No traits listed'],
        matchPercentage: match.overallScore,
        photoUrl: matchPartner.photoUrl || null,
        createdAt: match.createdAt,
        status: match.status,
      };
    });

    // Sort matches based on query parameters
    const sortedMatches = [...formattedMatches];

    if (sortBy === 'score') {
      sortedMatches.sort((a, b) => {
        if (order === 'asc') {
          return a.matchPercentage - b.matchPercentage;
        }
        return b.matchPercentage - a.matchPercentage; // desc
      });
    } else if (sortBy === 'date') {
      sortedMatches.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        if (order === 'asc') {
          return dateA - dateB;
        }
        return dateB - dateA; // desc
      });
    }

    return NextResponse.json({
      matches: sortedMatches,
      total: sortedMatches.length,
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
