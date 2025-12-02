/**
 * Compatibility Algorithm for Mānoa Roomie Match
 *
 * This module calculates compatibility scores between two users based on their lifestyle
 * preferences and habits collected from the lifestyle survey. The algorithm evaluates
 * five key categories and combines them into an overall compatibility percentage.
 *
 * Categories and Weights:
 * - Sleep Compatibility (20%): Compares sleep schedules (early bird vs night owl)
 * - Cleanliness Compatibility (25%): Compares tidiness preferences
 * - Noise Compatibility (20%): Evaluates noise tolerance levels
 * - Study Compatibility (20%): Compares study environment preferences
 * - Social Compatibility (15%): Evaluates social preferences and guest policies
 *
 * Note: Weights can be adjusted based on user feedback and usage patterns.
 *
 * @module compatibility
 */

import { UserProfile } from '@/types';
import type { CategoryScores } from '@/types';

/**
 * Converts sleep schedule string values to numeric scale for comparison.
 *
 * @param schedule - Sleep schedule preference from survey
 * @returns Numeric value (1-4 scale)
 */
function sleepScheduleToNumber(schedule: string): number {
  const mapping: Record<string, number> = {
    'early-bird': 1,
    neither: 2,
    unknown: 2,
    'night-owl': 3,
  };
  return mapping[schedule] || 2;
}

/**
 * Converts cleanliness string values to numeric scale for comparison.
 *
 * @param cleanliness - Cleanliness preference from survey
 * @returns Numeric value (1-5 scale)
 */
function cleanlinessToNumber(cleanliness: string): number {
  const mapping: Record<string, number> = {
    'very-clean': 1,
    'slightly-clean': 2,
    neither: 3,
    'slightly-dirty': 4,
    'very-dirty': 5,
  };
  return mapping[cleanliness] || 3;
}

/**
 * Converts study habits string values to numeric scale for comparison.
 *
 * @param studyHabits - Study preference from survey
 * @returns Numeric value (1-4 scale)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function studyHabitsToNumber(studyHabits: string): number {
  const mapping: Record<string, number> = {
    'quiet-study': 1,
    'background-noise': 2,
    flexible: 3,
    'social-study': 4,
  };
  return mapping[studyHabits] || 3;
}

/**
 * Converts social level string values to numeric scale for comparison.
 *
 * @param socialLevel - Social preference from survey
 * @returns Numeric value (1-4 scale)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function socialLevelToNumber(socialLevel: string): number {
  const mapping: Record<string, number> = {
    private: 1,
    'somewhat-social': 2,
    mixed: 3,
    'very-social': 4,
  };
  return mapping[socialLevel] || 3;
}

/**
 * Converts guest policy string values to numeric scale for comparison.
 *
 * @param guestPolicy - Guest preference from survey
 * @returns Numeric value (1-4 scale)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function guestPolicyToNumber(guestPolicy: string): number {
  const mapping: Record<string, number> = {
    'no-guests': 1,
    'rare-guests': 2,
    'occasional-guests': 3,
    'frequent-guests': 4,
  };
  return mapping[guestPolicy] || 3;
}

/**
 * Calculates sleep schedule compatibility between two users.
 *
 * Compares whether users are early birds, night owls, or neutral.
 * Mismatched sleep schedules can lead to disturbances and conflicts.
 *
 * @param u1 - First user's profile
 * @param u2 - Second user's profile
 * @returns Compatibility score from 0-100
 *
 * Scoring:
 * - Identical schedules: 100
 * - One level difference: 70 (e.g., early-bird vs neither)
 * - Two levels difference: 40 (e.g., early-bird vs night-owl)
 * - Each unit of difference reduces score by 30 points
 */
function calculateSleepCompatibility(u1: UserProfile, u2: UserProfile): number {
  const sleep1 = sleepScheduleToNumber(u1.sleepSchedule?.toString() || 'neither');
  const sleep2 = sleepScheduleToNumber(u2.sleepSchedule?.toString() || 'neither');
  const diff = Math.abs(sleep1 - sleep2);
  return Math.max(0, 100 - (diff * 30));
}

/**
 * Calculates cleanliness compatibility between two users.
 *
 * Compares tidiness levels from very clean to very dirty.
 * Mismatched cleanliness standards are a major source of roommate conflicts.
 *
 * @param u1 - First user's profile
 * @param u2 - Second user's profile
 * @returns Compatibility score from 0-100
 *
 * Scoring:
 * - Identical levels: 100
 * - One level difference: 75
 * - Two levels difference: 50
 * - Three+ levels difference: <25
 * - Each unit of difference reduces score by 25 points
 */
function calculateCleanlinessCompatibility(u1: UserProfile, u2: UserProfile): number {
  const clean1 = cleanlinessToNumber(u1.cleanliness?.toString() || 'neither');
  const clean2 = cleanlinessToNumber(u2.cleanliness?.toString() || 'neither');
  const diff = Math.abs(clean1 - clean2);
  return Math.max(0, 100 - (diff * 25));
}

/**
 * Calculates noise tolerance compatibility between two users.
 *
 * Compares noise tolerance levels from 0-100.
 * This affects study time, sleep quality, and overall living comfort.
 *
 * @param u1 - First user's profile
 * @param u2 - Second user's profile
 * @returns Compatibility score from 0-100
 *
 * Scoring:
 * - Converts 0-100 scale to percentage difference
 * - Scales down the difference to make it less harsh
 * - Maximum penalty for complete opposite (0 vs 100) is 50 points
 */
function calculateNoiseCompatibility(u1: UserProfile, u2: UserProfile): number {
  const noise1 = u1.noiseLevel || 50;
  const noise2 = u2.noiseLevel || 50;
  const diff = Math.abs(noise1 - noise2);
  // Scale difference: max diff of 100 gives 50 point penalty
  return Math.max(0, 100 - (diff * 0.5));
}

/**
 * Calculates study habits compatibility between two users.
 *
 * Compares study environment preferences (quiet vs social study).
 * Important for academic success and respecting each other's study time.
 *
 * Note: Currently returns a neutral score (100) as studyHabits field
 * needs to be added to the UserProfile database schema.
 *
 * @returns Compatibility score from 0-100
 *
 * Scoring:
 * - Identical preferences: 100
 * - Adjacent preferences: 67-75
 * - Opposite preferences (quiet vs social): 25
 * - Each unit of difference reduces score by 25 points
 */
function calculateStudyCompatibility(): number {
  // TODO: Update once studyHabits is added to UserProfile schema
  // const study1 = studyHabitsToNumber(u1.studyHabits || 'flexible');
  // const study2 = studyHabitsToNumber(u2.studyHabits || 'flexible');
  // const diff = Math.abs(study1 - study2);
  // return Math.max(0, 100 - (diff * 25));
  return 100; // Neutral score until field is added
}

/**
 * Calculates social compatibility between two users.
 *
 * Evaluates two social factors:
 * - Social interaction preferences (private vs very social)
 * - Guest frequency preferences (no guests vs frequent guests)
 *
 * @param u1 - First user's profile
 * @param u2 - Second user's profile
 * @returns Compatibility score from 0-100
 *
 * Scoring:
 * - Calculates average difference across both factors
 * - Each unit of average difference reduces score by 25 points
 * - Minimum score: 0
 */
function calculateSocialCompatibility(u1: UserProfile, u2: UserProfile): number {
  const social1 = u1.socialLevel || 3;
  const social2 = u2.socialLevel || 3;
  const guest1 = u1.guestFrequency || 3;
  const guest2 = u2.guestFrequency || 3;

  const socialDiff = Math.abs(social1 - social2);
  const guestDiff = Math.abs(guest1 - guest2);

  const avgDiff = (socialDiff + guestDiff) / 2;
  return Math.max(0, 100 - (avgDiff * 25));
}

/**
 * Calculates the overall compatibility score from category scores.
 *
 * Combines all five category scores using weighted averaging to produce
 * a single overall compatibility percentage.
 *
 * @param scores - Object containing all five category compatibility scores
 * @returns Overall compatibility score from 0-100
 *
 * Weights (Updated to match lifestyle survey):
 * - Cleanliness: 25% (highest priority - common conflict source)
 * - Sleep: 20% (affects daily routine and quality of life)
 * - Noise: 20% (affects study and sleep quality)
 * - Study: 20% (important for academic success)
 * - Social: 15% (includes guest policies and social preferences)
 */
export function calculateOverallScore(scores: CategoryScores): number {
  const weights = {
    sleepCompatibility: 0.20,
    cleanlinessCompatibility: 0.25,
    socialCompatibility: 0.15,
    lifestyleCompatibility: 0.20, // Noise compatibility
    interestsCompatibility: 0.20, // Study compatibility
  };

  return Math.round(
    scores.sleepCompatibility * weights.sleepCompatibility
    + scores.cleanlinessCompatibility * weights.cleanlinessCompatibility
    + scores.socialCompatibility * weights.socialCompatibility
    + scores.lifestyleCompatibility * weights.lifestyleCompatibility
    + scores.interestsCompatibility * weights.interestsCompatibility,
  );
}

/**
 * Main function to calculate complete compatibility between two users.
 *
 * This is the primary entry point for the compatibility algorithm.
 * It calculates scores for all five categories based on the lifestyle survey responses.
 *
 * @param user1 - First user's complete profile
 * @param user2 - Second user's complete profile
 * @returns Object containing all five category compatibility scores (each 0-100)
 *
 * Categories (aligned with lifestyle survey):
 * - sleepCompatibility: Based on sleep schedule preferences
 * - cleanlinessCompatibility: Based on cleanliness standards
 * - lifestyleCompatibility: Based on noise tolerance (repurposed)
 * - interestsCompatibility: Based on study habits (repurposed)
 * - socialCompatibility: Based on social level and guest policies
 *
 * Usage:
 * ```typescript
 * const scores = calculateCompatibility(userA, userB);
 * const overall = calculateOverallScore(scores);
 * console.log(`Overall compatibility: ${overall}%`);
 * ```
 */
export function calculateCompatibility(user1: UserProfile, user2: UserProfile): CategoryScores {
  const sleepCompatibility = calculateSleepCompatibility(user1, user2);
  const cleanlinessCompatibility = calculateCleanlinessCompatibility(user1, user2);
  const noiseCompatibility = calculateNoiseCompatibility(user1, user2);
  const studyCompatibility = calculateStudyCompatibility();
  const socialCompatibility = calculateSocialCompatibility(user1, user2);

  // Map to CategoryScores interface
  // Note: Using existing field names but with updated meanings
  return {
    sleepCompatibility,
    cleanlinessCompatibility,
    socialCompatibility,
    lifestyleCompatibility: noiseCompatibility, // Repurposed for noise
    interestsCompatibility: studyCompatibility, // Repurposed for study habits
  };
}
