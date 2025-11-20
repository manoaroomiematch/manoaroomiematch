/* eslint-disable import/prefer-default-export */
// src/app/api/matches/[matchId]/comparison/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getMatch } from '@/lib/dbActions';
import buildComparisonData from '@/lib/comparison';

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

    const match = await getMatch(matchId);
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 },
      );
    }

    // Determine which user is "current" and which is "match"
    const isUser1 = match.user1Id === currentUserId;
    const currentUser = isUser1 ? match.user1 : match.user2;
    const matchUser = isUser1 ? match.user2 : match.user1;

    // Build comparison data
    const comparisonData = buildComparisonData(currentUser, matchUser, match);

    return NextResponse.json(comparisonData);
  } catch (error) {
    console.error('Error building comparison:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
