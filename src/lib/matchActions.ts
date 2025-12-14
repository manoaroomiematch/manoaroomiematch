/**
 * Match Actions Utility
 * Manages user decisions on matches (accept, save, pass) using localStorage
 * No database calls needed - instant feedback and filtering
 */

export type MatchAction = 'accepted' | 'saved' | 'passed';

interface StoredMatchAction {
  matchId: string;
  action: MatchAction;
  timestamp: number;
}

const STORAGE_KEY = 'match-actions';

/**
 * Get all match actions from localStorage
 */
export function getMatchActions(): Map<string, MatchAction> {
  if (typeof window === 'undefined') return new Map();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Map();

    const actions: StoredMatchAction[] = JSON.parse(stored);
    return new Map(actions.map(a => [a.matchId, a.action]));
  } catch (error) {
    console.error('Error reading match actions:', error);
    return new Map();
  }
}

/**
 * Save a match action
 */
export function saveMatchAction(matchId: string, action: MatchAction): void {
  if (typeof window === 'undefined') return;

  try {
    const actions = getMatchActions();
    actions.set(matchId, action);

    const stored: StoredMatchAction[] = Array.from(actions.entries()).map(([id, act]) => ({
      matchId: id,
      action: act,
      timestamp: Date.now(),
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error('Error saving match action:', error);
  }
}

/**
 * Get a specific match action
 */
export function getMatchAction(matchId: string): MatchAction | null {
  const actions = getMatchActions();
  return actions.get(matchId) || null;
}

/**
 * Get all saved matches
 */
export function getSavedMatches(): string[] {
  const actions = getMatchActions();
  return Array.from(actions.entries())
    .filter(([, action]) => action === 'saved')
    .map(([matchId]) => matchId);
}

/**
 * Get all accepted matches
 */
export function getAcceptedMatches(): string[] {
  const actions = getMatchActions();
  return Array.from(actions.entries())
    .filter(([, action]) => action === 'accepted')
    .map(([matchId]) => matchId);
}

/**
 * Get all passed matches (to filter from browse)
 */
export function getPassedMatches(): string[] {
  const actions = getMatchActions();
  return Array.from(actions.entries())
    .filter(([, action]) => action === 'passed')
    .map(([matchId]) => matchId);
}

/**
 * Clear all match actions (for testing or user preference)
 */
export function clearAllMatchActions(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing match actions:', error);
  }
}

/**
 * Check if a match has been passed
 */
export function isMatchPassed(matchId: string): boolean {
  return getMatchAction(matchId) === 'passed';
}

/**
 * Check if a match has been saved
 */
export function isMatchSaved(matchId: string): boolean {
  return getMatchAction(matchId) === 'saved';
}

/**
 * Check if a match has been accepted
 */
export function isMatchAccepted(matchId: string): boolean {
  return getMatchAction(matchId) === 'accepted';
}
