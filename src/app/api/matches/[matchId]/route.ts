/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getMatch } from '@/lib/dbActions';

export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } },
) {
  try {
    const { matchId } = params;

    // Get match with both user profiles
    const match = await getMatch(matchId);

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      match,
      user1: match.user1,
      user2: match.user2,
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
