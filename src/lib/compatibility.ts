/*
This is a template whipped up by an AI. We can finetune the values and other stuff
later.

*/

import { UserProfile } from '@/types';
import type { CategoryScores } from '@/types';

function calculateSleepCompatibility(u1: UserProfile, u2: UserProfile): number {
  const diff = Math.abs(u1.sleepSchedule - u2.sleepSchedule);
  return Math.max(0, 100 - (diff * 25));
}

function calculateCleanlinessCompatibility(u1: UserProfile, u2: UserProfile): number {
  const diff = Math.abs(u1.cleanliness - u2.cleanliness);
  return Math.max(0, 100 - (diff * 30));
}

function calculateSocialCompatibility(u1: UserProfile, u2: UserProfile): number {
  const noiseDiff = Math.abs(u1.noiseLevel - u2.noiseLevel);
  const socialDiff = Math.abs(u1.socialLevel - u2.socialLevel);
  const guestDiff = Math.abs(u1.guestFrequency - u2.guestFrequency);

  const avgDiff = (noiseDiff + socialDiff + guestDiff) / 3;
  return Math.max(0, 100 - (avgDiff * 25));
}

function calculateLifestyleCompatibility(u1: UserProfile, u2: UserProfile): number {
  let score = 100;

  // Smoking is a dealbreaker
  if (u1.smoking !== u2.smoking) score -= 40;

  // Pets matter
  if (u1.pets !== u2.pets) score -= 30;

  // Temperature preference
  const tempDiff = Math.abs(u1.temperature - u2.temperature);
  score -= (tempDiff * 5);

  return Math.max(0, score);
}

function calculateInterestsCompatibility(u1: UserProfile, u2: UserProfile): number {
  const commonInterests = u1.interests.filter((i: any) => u2.interests.includes(i));
  const totalInterests = new Set([...u1.interests, ...u2.interests]).size;

  if (totalInterests === 0) return 50;

  const overlapRatio = commonInterests.length / totalInterests;
  return Math.round(overlapRatio * 100);
}

export function calculateOverallScore(scores: CategoryScores): number {
  const weights = {
    sleepCompatibility: 0.2,
    cleanlinessCompatibility: 0.25,
    socialCompatibility: 0.2,
    lifestyleCompatibility: 0.25,
    interestsCompatibility: 0.1,
  };

  return Math.round(
    scores.sleepCompatibility * weights.sleepCompatibility
    + scores.cleanlinessCompatibility * weights.cleanlinessCompatibility
    + scores.socialCompatibility * weights.socialCompatibility
    + scores.lifestyleCompatibility * weights.lifestyleCompatibility
    + scores.interestsCompatibility * weights.interestsCompatibility,
  );
}

export function calculateCompatibility(user1: UserProfile, user2: UserProfile): CategoryScores {
  const sleepCompatibility = calculateSleepCompatibility(user1, user2);
  const cleanlinessCompatibility = calculateCleanlinessCompatibility(user1, user2);
  const socialCompatibility = calculateSocialCompatibility(user1, user2);
  const lifestyleCompatibility = calculateLifestyleCompatibility(user1, user2);
  const interestsCompatibility = calculateInterestsCompatibility(user1, user2);

  return {
    sleepCompatibility,
    cleanlinessCompatibility,
    socialCompatibility,
    lifestyleCompatibility,
    interestsCompatibility,
  };
}
