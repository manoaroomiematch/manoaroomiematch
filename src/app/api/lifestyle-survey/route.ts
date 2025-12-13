/* eslint-disable import/prefer-default-export */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { saveLifestyleSurveyAndMatch } from '@/lib/dbActions';

/**
 * POST /api/lifestyle-survey
 * Saves the lifestyle survey data and triggers matching
 */
export async function POST(request: Request) {
  try {
    // Get the current user's session
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Parse the request body
    const surveyData = await request.json();

    // Validate the survey data
    if (!surveyData.sleepSchedule
        || surveyData.noiseTolerance === undefined
        || !surveyData.cleanliness
        || !surveyData.studyHabits
        || !surveyData.socialLevel
        || !surveyData.guestPolicy) {
      return NextResponse.json(
        { error: 'Missing required survey fields' },
        { status: 400 },
      );
    }

    // Save the survey and trigger matching
    const profile = await saveLifestyleSurveyAndMatch(
      session.user.email,
      surveyData,
    );

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error: any) {
    console.error('Error saving lifestyle survey:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save survey' },
      { status: 500 },
    );
  }
}
