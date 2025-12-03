/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { getMatch } from '@/lib/dbActions';
import buildComparisonData from '@/lib/comparison';
import { CategoryBreakdown } from '@/types';
import { prisma } from '@/lib/prisma';

function buildHighlights(categoryBreakdown: CategoryBreakdown[]) {
  const compatibleTraits = categoryBreakdown
    .filter((category) => category.compatibility >= 75)
    .map((category) => `Aligned on ${category.category.toLowerCase()}: ${category.theirValue}`);

  const conflicts = categoryBreakdown
    .filter((category) => category.compatibility < 60)
    .map((category) => `Different ${category.category.toLowerCase()}: ${category.yourValue} vs ${category.theirValue}`);

  return { compatibleTraits, conflicts };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } },
) {
  try {
    const { matchId } = params;
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');

    console.log('[Match API] Request received:', { matchId, userIdParam });

    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error('[Match API] Unauthorized - no session');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 },
      );
    }

    // Get match with both user profiles
    const match = await getMatch(matchId);

    if (!match) {
      console.error('[Match API] Match not found:', matchId);
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 },
      );
    }

    console.log('[Match API] Match found:', {
      matchId: match.id,
      user1Id: match.user1Id,
      user2Id: match.user2Id,
    });

    // Resolve the current user's profile ID
    let currentUserProfileId: string;

    if (userIdParam) {
      // If userId is provided, try to use it
      // Check if it's already a profile ID (CUID format)
      if (userIdParam.startsWith('c') && userIdParam.length > 20) {
        currentUserProfileId = userIdParam;
        console.log('[Match API] Using provided profile ID:', currentUserProfileId);
      } else {
        // It's a numeric user ID, need to convert to profile ID
        const numericUserId = parseInt(userIdParam, 10);
        if (Number.isNaN(numericUserId)) {
          console.error('[Match API] Invalid user ID format:', userIdParam);
          return NextResponse.json(
            { error: 'Invalid user ID format' },
            { status: 400 },
          );
        }

        const userProfile = await prisma.userProfile.findUnique({
          where: { userId: numericUserId },
        });

        if (!userProfile) {
          console.error('[Match API] User profile not found for userId:', numericUserId);
          return NextResponse.json(
            { error: 'User profile not found' },
            { status: 404 },
          );
        }

        currentUserProfileId = userProfile.id;
        console.log('[Match API] Converted user ID to profile ID:', {
          userId: numericUserId,
          profileId: currentUserProfileId,
        });
      }
    } else {
      // No userId provided, look up from session email
      const userProfile = await prisma.userProfile.findFirst({
        where: { email: session.user.email },
      });

      if (!userProfile) {
        console.error('[Match API] User profile not found for email:', session.user.email);
        return NextResponse.json(
          { error: 'User profile not found' },
          { status: 404 },
        );
      }

      currentUserProfileId = userProfile.id;
      console.log('[Match API] Using profile ID from session:', currentUserProfileId);
    }

    // Check if user is part of this match
    if (match.user1Id !== currentUserProfileId && match.user2Id !== currentUserProfileId) {
      console.error('[Match API] User not part of match:', {
        currentUserProfileId,
        match: { user1Id: match.user1Id, user2Id: match.user2Id },
      });
      return NextResponse.json(
        { error: 'User is not part of this match' },
        { status: 403 },
      );
    }

    // Determine which user is current and which is the match
    const isUser1 = match.user1Id === currentUserProfileId;
    const currentUser = isUser1 ? match.user1 : match.user2;
    const matchUser = isUser1 ? match.user2 : match.user1;

    if (!currentUser || !matchUser) {
      console.error('[Match API] Missing user profiles:', {
        currentUser: !!currentUser,
        matchUser: !!matchUser,
      });
      return NextResponse.json(
        { error: 'Missing user profiles for match' },
        { status: 500 },
      );
    }

    console.log('[Match API] Building comparison data:', {
      currentUser: currentUser.name,
      matchUser: matchUser.name,
    });

    // Build comparison data
    const comparisonData = buildComparisonData(currentUser, matchUser, match);
    const { compatibleTraits, conflicts } = buildHighlights(comparisonData.categoryBreakdown);

    return NextResponse.json({
      ...comparisonData,
      compatibleTraits,
      conflicts,
    });
  } catch (error) {
    console.error('[Match API] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
