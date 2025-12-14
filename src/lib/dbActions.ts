'use server';

import { hash } from 'bcrypt';
import { prisma } from './prisma';
import { calculateCompatibility, calculateOverallScore } from './compatibility';

/**
 * Creates a new user in the database.
 * @param credentials, an object with the following properties: email, password, firstName, lastName.
 */
export async function createUser(credentials: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  // console.log(`createUser data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: credentials.email,
          password,
        },
      });

      await tx.userProfile.create({
        data: {
          userId: user.id,
          email: credentials.email,
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          name: `${credentials.firstName} ${credentials.lastName}`,
        },
      });
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

/**
 * Updates a user's profile information.
 */
export async function updateUserProfile(email: string, data: {
  firstName?: string;
  lastName?: string;
  major?: string;
  classStanding?: string;
  graduationYear?: number;
  needRoommateBy?: Date;
  instagram?: string;
  snapchat?: string;
  hometown?: string;
  housingType?: string;
  preferredDorm?: string;
  specificBuilding?: string;
  budget?: string;
  photoUrl?: string;
  smoking?: boolean;
  drinking?: string;
  pets?: boolean;
  petTypes?: string[];
  dietary?: string[];
  interests?: string[];
  workSchedule?: string;
  pronouns?: string;
  bio?: string;
}) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  const updateData: any = { ...data };
  if (data.firstName && data.lastName) {
    updateData.name = `${data.firstName} ${data.lastName}`;
  }

  await prisma.userProfile.update({
    where: { userId: user.id },
    data: updateData,
  });
}

/**
 * Changes the password of an existing user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function changePassword(credentials: { email: string; password: string }) {
  // console.log(`changePassword data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);
  await prisma.user.update({
    where: { email: credentials.email },
    data: {
      password,
    },
  });
}
/**
 * Gets a user profile by email
 */
export async function getProfileByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });
  return user?.profile;
}

/**
 * Gets a user profile by user ID
 */
export async function getUserProfile(userId: string) {
  return prisma.userProfile.findUnique({
    where: { id: userId },
  });
}

/**
 * Gets a match by match ID, including both user profiles
 */
export async function getMatch(matchId: string) {
  return prisma.match.findUnique({
    where: { id: matchId },
    include: {
      user1: true,
      user2: true,
    },
  });
}

/**
 * Creates a new match between two users
 */
export async function createMatch(user1Id: string, user2Id: string) {
  // Get both profiles
  const [user1, user2] = await Promise.all([
    prisma.userProfile.findUnique({ where: { id: user1Id } }),
    prisma.userProfile.findUnique({ where: { id: user2Id } }),
  ]);

  if (!user1 || !user2) {
    throw new Error('User profiles not found');
  }

  // Calculate compatibility scores
  const categoryScores = calculateCompatibility(user1, user2);
  const overallScore = calculateOverallScore(categoryScores);

  // Create the match
  return prisma.match.create({
    data: {
      user1Id,
      user2Id,
      overallScore,
      categoryScores: categoryScores as any, // Prisma Json type
      status: 'pending',
      icebreakers: [],
    },
  });
}

/**
 * Updates a match with AI-generated content
 */
export async function updateMatchWithAI(
  matchId: string,
  report: string,
  icebreakers: string[],
) {
  return prisma.match.update({
    where: { id: matchId },
    data: {
      compatibilityReport: report,
      icebreakers,
      updatedAt: new Date(),
    },
  });
}

/**
 * Gets all matches for a user
 */
export async function getMatchesByUserId(userId: string) {
  return prisma.match.findMany({
    where: {
      OR: [
        { user1Id: userId },
        { user2Id: userId },
      ],
    },
    include: {
      user1: {
        include: {
          user: true,
        },
      },
      user2: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Converts survey string values to the numeric scale used in the database
 */
function convertSurveyToDatabase(surveyData: {
  sleepSchedule: string;
  noiseTolerance: number;
  cleanliness: string;
  studyHabits: string;
  socialLevel: string;
  guestPolicy: string;
}) {
  // Sleep schedule mapping (string -> Int 1-5)
  const sleepScheduleMap: Record<string, number> = {
    'early-bird': 1,
    neither: 3,
    unknown: 3,
    'night-owl': 5,
  };

  // Cleanliness mapping (string -> Int 1-5)
  const cleanlinessMap: Record<string, number> = {
    'very-clean': 5,
    'slightly-clean': 4,
    neither: 3,
    'slightly-dirty': 2,
    'very-dirty': 1,
  };

  // Social level mapping (string -> Int 1-4)
  const socialLevelMap: Record<string, number> = {
    private: 1,
    'somewhat-social': 2,
    mixed: 3,
    'very-social': 4,
  };

  // Guest frequency mapping (string -> Int 1-4)
  const guestFrequencyMap: Record<string, number> = {
    'no-guests': 1,
    'rare-guests': 2,
    'occasional-guests': 3,
    'frequent-guests': 4,
  };

  return {
    sleepSchedule: sleepScheduleMap[surveyData.sleepSchedule] || 3,
    cleanliness: cleanlinessMap[surveyData.cleanliness] || 3,
    noiseLevel: surveyData.noiseTolerance, // Already a number 0-100
    socialLevel: socialLevelMap[surveyData.socialLevel] || 3,
    guestFrequency: guestFrequencyMap[surveyData.guestPolicy] || 3,
  };
}

/**
 * Saves lifestyle survey data to the user's profile
 */
export async function saveLifestyleSurvey(email: string, surveyData: {
  sleepSchedule: string;
  noiseTolerance: number;
  cleanliness: string;
  studyHabits: string;
  socialLevel: string;
  guestPolicy: string;
}) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Convert survey data to database format
  const dbData = convertSurveyToDatabase(surveyData);

  // Update the user's profile with lifestyle data
  const updatedProfile = await prisma.userProfile.update({
    where: { userId: user.id },
    data: dbData,
  });

  return updatedProfile;
}

/**
 * Saves lifestyle survey and generates matches for the user
 * This is called when a user completes the lifestyle survey
 */
export async function saveLifestyleSurveyAndMatch(email: string, surveyData: {
  sleepSchedule: string;
  noiseTolerance: number;
  cleanliness: string;
  studyHabits: string;
  socialLevel: string;
  guestPolicy: string;
}) {
  // First, save the lifestyle survey data
  const profile = await saveLifestyleSurvey(email, surveyData);

  // Get the user ID from the profile
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Import and call the existing match generation function
  // This will generate matches for the new user against all existing users
  const { generateMatchesForUser } = await import('./matchGeneration');
  const matchIds = await generateMatchesForUser(user.id);

  console.log(`Generated ${matchIds.length} matches for user ${email}`);

  return profile;
}
