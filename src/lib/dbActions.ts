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
      user1: true,
      user2: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
