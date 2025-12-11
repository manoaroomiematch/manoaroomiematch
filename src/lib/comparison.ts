import { UserProfile, Match, ComparisonData, CategoryBreakdown, CategoryScores } from '@/types';

function getSleepLabel(val: number): string {
  const labels = ['Early Bird', 'Morning Person', 'Flexible', 'Evening Person', 'Night Owl'];
  return labels[val - 1] || 'Unknown';
}

function getCleanlinessLabel(val: number): string {
  const labels = ['Relaxed', 'Casual', 'Moderate', 'Tidy', 'Very Clean'];
  return labels[val - 1] || 'Unknown';
}

function getNoiseLabel(val: number): string {
  const labels = ['Very Quiet', 'Quiet', 'Moderate', 'Active', 'Lively'];
  return labels[val - 1] || 'Unknown';
}

function getSocialLabel(val: number): string {
  const labels = ['Homebody', 'Occasional', 'Balanced', 'Social', 'Very Social'];
  return labels[val - 1] || 'Unknown';
}

function getLifestyleLabel(user: UserProfile): string {
  const traits: string[] = [];
  if (user.dietary.length > 0) traits.push(user.dietary[0]);
  return traits.length > 0 ? traits.join(', ') : 'Standard';
}
export default function buildComparisonData(
  currentUser: UserProfile,
  matchUser: UserProfile,
  match: Match,
): ComparisonData {
  // Parse the categoryScores from JSON if needed
  const scores = typeof match.categoryScores === 'string'
    ? JSON.parse(match.categoryScores)
    : match.categoryScores as unknown as CategoryScores;

  const categoryBreakdown: CategoryBreakdown[] = [
    {
      category: 'Sleep Schedule',
      yourValue: getSleepLabel(currentUser.sleepSchedule),
      theirValue: getSleepLabel(matchUser.sleepSchedule),
      compatibility: scores.sleepCompatibility,
      description: 'When you typically sleep and wake up',
    },
    {
      category: 'Cleanliness',
      yourValue: getCleanlinessLabel(currentUser.cleanliness),
      theirValue: getCleanlinessLabel(matchUser.cleanliness),
      compatibility: scores.cleanlinessCompatibility,
      description: 'How tidy you keep shared spaces',
    },
    {
      category: 'Noise Level',
      yourValue: getNoiseLabel(currentUser.noiseLevel),
      theirValue: getNoiseLabel(matchUser.noiseLevel),
      compatibility: scores.socialCompatibility,
      description: 'Typical noise and activity level',
    },
    {
      category: 'Social Life',
      yourValue: getSocialLabel(currentUser.socialLevel),
      theirValue: getSocialLabel(matchUser.socialLevel),
      compatibility: scores.socialCompatibility,
      description: 'How often you socialize and have guests',
    },
    {
      category: 'Lifestyle',
      yourValue: getLifestyleLabel(currentUser),
      theirValue: getLifestyleLabel(matchUser),
      compatibility: scores.lifestyleCompatibility,
      description: 'Dietary preferences and habits',
    },
    {
      category: 'Shared Interests',
      yourValue: currentUser.interests.slice(0, 3).join(', ') || 'None listed',
      theirValue: matchUser.interests.slice(0, 3).join(', ') || 'None listed',
      compatibility: scores.interestsCompatibility,
      description: 'Hobbies and activities you both enjoy',
    },
  ];

  return {
    currentUser,
    matchUser,
    match,
    categoryBreakdown,
  };
}
