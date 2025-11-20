'use server';

import { Stuff, Condition } from '@prisma/client';
import { hash } from 'bcrypt';
import { redirect } from 'next/navigation';
import { prisma } from './prisma';
import { calculateCompatibility, calculateOverallScore } from './compatibility';

/**
 * Adds a new stuff to the database.
 * @param stuff, an object with the following properties: name, quantity, owner, condition.
 */
export async function addStuff(stuff: { name: string; quantity: number; owner: string; condition: string }) {
  // console.log(`addStuff data: ${JSON.stringify(stuff, null, 2)}`);
  let condition: Condition = 'good';
  if (stuff.condition === 'poor') {
    condition = 'poor';
  } else if (stuff.condition === 'excellent') {
    condition = 'excellent';
  } else {
    condition = 'fair';
  }
  await prisma.stuff.create({
    data: {
      name: stuff.name,
      quantity: stuff.quantity,
      owner: stuff.owner,
      condition,
    },
  });
  // After adding, redirect to the list page
  redirect('/list');
}

/**
 * Edits an existing stuff in the database.
 * @param stuff, an object with the following properties: id, name, quantity, owner, condition.
 */
export async function editStuff(stuff: Stuff) {
  // console.log(`editStuff data: ${JSON.stringify(stuff, null, 2)}`);
  await prisma.stuff.update({
    where: { id: stuff.id },
    data: {
      name: stuff.name,
      quantity: stuff.quantity,
      owner: stuff.owner,
      condition: stuff.condition,
    },
  });
  // After updating, redirect to the list page
  redirect('/list');
}

/**
 * Deletes an existing stuff from the database.
 * @param id, the id of the stuff to delete.
 */
export async function deleteStuff(id: number) {
  // console.log(`deleteStuff id: ${id}`);
  await prisma.stuff.delete({
    where: { id },
  });
  // After deleting, redirect to the list page
  redirect('/list');
}

/**
 * Creates a new user in the database.
 * @param credentials, an object with the following properties: email, password.
 */
export async function createUser(credentials: { email: string; password: string }) {
  // console.log(`createUser data: ${JSON.stringify(credentials, null, 2)}`);
  const password = await hash(credentials.password, 10);
  await prisma.user.create({
    data: {
      email: credentials.email,
      password,
    },
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
