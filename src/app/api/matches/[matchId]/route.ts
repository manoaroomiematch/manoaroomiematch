/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getMatch } from '@/lib/dbActions';
import buildComparisonData from '@/lib/comparison';
import { CategoryBreakdown } from '@/types';

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
    const currentUserId = searchParams.get('userId');

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 },
      );
    }

    // Get match with both user profiles
    const match = await getMatch(matchId);

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 },
      );
    }

    if (match.user1Id !== currentUserId && match.user2Id !== currentUserId) {
      return NextResponse.json(
        { error: 'User is not part of this match' },
        { status: 403 },
      );
    }

    const isUser1 = match.user1Id === currentUserId;
    const currentUser = isUser1 ? match.user1 : match.user2;
    const matchUser = isUser1 ? match.user2 : match.user1;

    if (!currentUser || !matchUser) {
      return NextResponse.json(
        { error: 'Missing user profiles for match' },
        { status: 500 },
      );
    }

    const comparisonData = buildComparisonData(currentUser, matchUser, match);
    const { compatibleTraits, conflicts } = buildHighlights(comparisonData.categoryBreakdown);

    return NextResponse.json({
      ...comparisonData,
      compatibleTraits,
      conflicts,
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
