import { UserProfile as PrismaUserProfile, Match as PrismaMatch } from '@prisma/client';

// Re-export Prisma types for convenience
export type UserProfile = PrismaUserProfile;
export type Match = PrismaMatch;

// Custom types for our comparison logic
export interface CategoryScores {
  sleepCompatibility: number;
  cleanlinessCompatibility: number;
  socialCompatibility: number;
  lifestyleCompatibility: number;
  interestsCompatibility: number;
}

export interface ComparisonData {
  currentUser: UserProfile;
  matchUser: UserProfile;
  match: Match;
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: string;
  yourValue: string | number;
  theirValue: string | number;
  compatibility: number;
  description: string;
}
