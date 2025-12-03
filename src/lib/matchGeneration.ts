/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/**
 * Match Generation System
 *
 * This module provides functions to automatically generate and update matches
 * between users based on their lifestyle preferences and compatibility.
 *
 * Features:
 * - Generate matches for new users against all existing users
 * - Regenerate matches when a user updates their profile
 * - Batch generate matches for all users
 * - Prevent duplicate matches
 * - Automatic compatibility scoring
 */

'use server';

import { prisma } from './prisma';
import { calculateCompatibility, calculateOverallScore } from './compatibility';

/**
 * Generates matches for a specific user against all other users
 *
 * @param userId - The user ID (from User table, not UserProfile)
 * @returns Array of created match IDs
 *
 * Use cases:
 * - When a new user completes their lifestyle survey
 * - When a user updates their lifestyle preferences
 * - Manual refresh of matches for a specific user
 */
export async function generateMatchesForUser(userId: number): Promise<string[]> {
  console.log(`Starting match generation for user ID: ${userId}`);

  // Get the user's profile
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!userProfile) {
    throw new Error(`User profile not found for user ID: ${userId}`);
  }

  // Get all other users' profiles (exclude self)
  const otherProfiles = await prisma.userProfile.findMany({
    where: {
      userId: { not: userId },
    },
  });

  console.log(`Found ${otherProfiles.length} potential matches for user ${userProfile.name}`);

  const createdMatchIds: string[] = [];

  // Generate matches with each user
  for (const otherProfile of otherProfiles) {
    try {
      // Check if match already exists (in either direction)
      const existingMatch = await prisma.match.findFirst({
        where: {
          OR: [
            {
              user1Id: userProfile.id,
              user2Id: otherProfile.id,
            },
            {
              user1Id: otherProfile.id,
              user2Id: userProfile.id,
            },
          ],
        },
      });

      if (existingMatch) {
        console.log(`Match already exists between ${userProfile.name} and ${otherProfile.name}, skipping...`);
        continue;
      }

      // Calculate compatibility
      const categoryScores = calculateCompatibility(userProfile, otherProfile);
      const overallScore = calculateOverallScore(categoryScores);

      // Create the match
      const match = await prisma.match.create({
        data: {
          user1Id: userProfile.id,
          user2Id: otherProfile.id,
          overallScore,
          categoryScores: categoryScores as any,
          status: 'pending',
          icebreakers: [],
        },
      });

      createdMatchIds.push(match.id);
      console.log(`Created match between ${userProfile.name} and ${otherProfile.name} (${overallScore}%)`);
    } catch (error) {
      console.error(`Error creating match with ${otherProfile.name}:`, error);
      // Continue with other matches even if one fails
    }
  }

  console.log(`Successfully created ${createdMatchIds.length} matches for user ${userProfile.name}`);
  return createdMatchIds;
}

/**
 * Regenerates (updates) existing matches for a user
 *
 * This is useful when a user updates their lifestyle preferences
 * and you want to recalculate compatibility scores without creating duplicates.
 *
 * @param userId - The user ID (from User table)
 * @returns Number of matches updated
 */
export async function regenerateMatchesForUser(userId: number): Promise<number> {
  console.log(`Regenerating matches for user ID: ${userId}`);

  // Get the user's profile
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!userProfile) {
    throw new Error(`User profile not found for user ID: ${userId}`);
  }

  // Find all existing matches for this user
  const existingMatches = await prisma.match.findMany({
    where: {
      OR: [
        { user1Id: userProfile.id },
        { user2Id: userProfile.id },
      ],
    },
    include: {
      user1: true,
      user2: true,
    },
  });

  console.log(`Found ${existingMatches.length} existing matches to regenerate`);

  let updatedCount = 0;

  // Recalculate each match
  for (const match of existingMatches) {
    try {
      // Determine which profile is the "other" user
      const isUser1 = match.user1Id === userProfile.id;
      const currentUserProfile = isUser1 ? match.user1 : match.user2;
      const otherUserProfile = isUser1 ? match.user2 : match.user1;

      // Recalculate compatibility
      const categoryScores = calculateCompatibility(currentUserProfile, otherUserProfile);
      const overallScore = calculateOverallScore(categoryScores);

      // Update the match
      await prisma.match.update({
        where: { id: match.id },
        data: {
          overallScore,
          categoryScores: categoryScores as any,
          updatedAt: new Date(),
        },
      });

      updatedCount++;
      console.log(`Updated match with ${otherUserProfile.name} (new score: ${overallScore}%)`);
    } catch (error) {
      console.error(`Error updating match ${match.id}:`, error);
    }
  }

  console.log(`Successfully regenerated ${updatedCount} matches for user ${userProfile.name}`);
  return updatedCount;
}

/**
 * Generates matches for ALL users in the database
 *
 * This is useful for:
 * - Initial setup/seeding
 * - Bulk regeneration after algorithm changes
 * - Admin tools
 *
 * WARNING: This can be slow for large user bases. Consider running as a background job.
 *
 * @returns Object with statistics about matches created
 */
export async function generateAllMatches(): Promise<{
  totalUsers: number;
  matchesCreated: number;
  errors: number;
}> {
  console.log('Starting batch match generation for all users...');

  // Get all users with profiles
  const users = await prisma.user.findMany({
    include: { profile: true },
  });

  console.log(`Found ${users.length} users to process`);

  let totalMatchesCreated = 0;
  let errors = 0;

  // Generate matches for each user
  for (const user of users) {
    if (!user.profile) {
      console.log(`Skipping user ${user.email} - no profile exists`);
      continue;
    }

    try {
      const matchIds = await generateMatchesForUser(user.id);
      totalMatchesCreated += matchIds.length;
    } catch (error) {
      console.error(`Error generating matches for user ${user.email}:`, error);
      errors++;
    }
  }

  const stats = {
    totalUsers: users.length,
    matchesCreated: totalMatchesCreated,
    errors,
  };

  console.log('Batch match generation complete:', stats);
  return stats;
}

/**
 * Deletes all matches for a specific user
 *
 * Useful for:
 * - User wants to reset their matches
 * - Before regenerating matches from scratch
 * - User deletion cleanup
 *
 * @param userId - The user ID (from User table)
 * @returns Number of matches deleted
 */
export async function deleteMatchesForUser(userId: number): Promise<number> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!userProfile) {
    throw new Error(`User profile not found for user ID: ${userId}`);
  }

  // Delete all matches where user is either user1 or user2
  const result = await prisma.match.deleteMany({
    where: {
      OR: [
        { user1Id: userProfile.id },
        { user2Id: userProfile.id },
      ],
    },
  });

  console.log(`Deleted ${result.count} matches for user ${userProfile.name}`);
  return result.count;
}

/**
 * Gets match statistics for a user
 *
 * @param userId - The user ID (from User table)
 * @returns Statistics about the user's matches
 */
export async function getMatchStats(userId: number): Promise<{
  totalMatches: number;
  highMatches: number; // 80%+
  mediumMatches: number; // 60-79%
  lowMatches: number; // <60%
  averageScore: number;
}> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!userProfile) {
    throw new Error(`User profile not found for user ID: ${userId}`);
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { user1Id: userProfile.id },
        { user2Id: userProfile.id },
      ],
    },
  });

  const totalMatches = matches.length;
  const highMatches = matches.filter(m => m.overallScore >= 80).length;
  const mediumMatches = matches.filter(m => m.overallScore >= 60 && m.overallScore < 80).length;
  const lowMatches = matches.filter(m => m.overallScore < 60).length;
  const averageScore = totalMatches > 0
    ? Math.round(matches.reduce((sum, m) => sum + m.overallScore, 0) / totalMatches)
    : 0;

  return {
    totalMatches,
    highMatches,
    mediumMatches,
    lowMatches,
    averageScore,
  };
}

/**
 * Hook function to automatically generate matches when user completes survey
 *
 * Call this after a user completes their lifestyle survey or updates their profile.
 * It intelligently decides whether to generate new matches or regenerate existing ones.
 *
 * @param userId - The user ID (from User table)
 * @param isNewUser - Whether this is a new user (true) or profile update (false)
 * @returns Object with match generation results
 */
export async function handleUserProfileComplete(
  userId: number,
  isNewUser: boolean = false,
): Promise<{
    matchesCreated: number;
    matchesUpdated: number;
    stats: Awaited<ReturnType<typeof getMatchStats>>;
  }> {
  console.log(`Handling profile completion for user ID ${userId} (new user: ${isNewUser})`);

  let matchesCreated = 0;
  let matchesUpdated = 0;

  if (isNewUser) {
    // New user - generate all matches
    const matchIds = await generateMatchesForUser(userId);
    matchesCreated = matchIds.length;
  } else {
    // Existing user - regenerate matches (update compatibility scores)
    matchesUpdated = await regenerateMatchesForUser(userId);
  }

  // Get updated statistics
  const stats = await getMatchStats(userId);

  return {
    matchesCreated,
    matchesUpdated,
    stats,
  };
}
