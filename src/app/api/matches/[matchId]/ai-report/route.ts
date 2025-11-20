/* eslint-disable import/prefer-default-export */
import { NextRequest, NextResponse } from 'next/server';
import { getMatch, updateMatchWithAI } from '@/lib/dbActions';

export async function POST(
  req: NextRequest,
  { params }: { params: { matchId: string } },
) {
  try {
    const { matchId } = params;

    const match = await getMatch(matchId);
    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 },
      );
    }

    // TODO: We'll add AI generation in the next step
    // For now, return placeholder data
    const report = 'Compatibility report will be generated here using AI.';
    const icebreakers = [
      "What's your ideal living environment?",
      'How do you like to spend your weekends?',
      "What's important to you in a roommate?",
    ];

    // Update match with the AI content
    await updateMatchWithAI(matchId, report, icebreakers);

    return NextResponse.json({
      report,
      icebreakers,
    });
  } catch (error) {
    console.error('Error generating AI content:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI content' },
      { status: 500 },
    );
  }
}
