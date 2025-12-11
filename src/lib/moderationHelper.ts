/**
 * Moderation Helper Utilities
 * Centralized logic for updating user state based on moderation actions
 */

/**
 * Determines the new flag status based on the action taken
 * @param action The moderation action (resolve, suspend, deactivate, etc.)
 * @returns The new flag status to set
 */
export function getFlagStatusForAction(action: string): string {
  switch (action) {
    case 'resolve':
    case 'unsuspend':
      return 'resolved';
    case 'reactivate':
      return 'active';
    case 'deactivate':
      return 'user_deactivated';
    case 'suspend':
      return 'suspended';
    default:
      return 'pending';
  }
}

/**
 * Updates user state based on moderation action
 * Consolidates the logic for suspend, unsuspend, deactivate, and reactivate actions
 * @param user The current user object
 * @param action The moderation action taken
 * @param userData The response data from the API containing updated user info
 * @returns Updated user object
 */
export function updateUserForModerationAction(
  user: any,
  action: string,
  userData?: { suspendedUntil?: string | null; suspensionCount?: number; active?: boolean },
): any {
  const updatedUser = { ...user };

  switch (action) {
    case 'suspend':
      if (userData) {
        updatedUser.suspendedUntil = userData.suspendedUntil;
        updatedUser.suspensionCount = userData.suspensionCount;
      }
      break;

    case 'unsuspend':
      updatedUser.suspendedUntil = null;
      break;

    case 'deactivate':
      updatedUser.active = false;
      updatedUser.suspendedUntil = null;
      break;

    case 'reactivate':
      updatedUser.active = true;
      break;

    case 'resolve':
      // Resolve doesn't change user state, only flag state
      break;

    default:
      break;
  }

  return updatedUser;
}

/**
 * Maps action names to user-friendly error messages
 * @param action The action that failed
 * @returns A user-friendly error message
 */
export function getErrorMessageForAction(action: string): string {
  const actionMap: { [key: string]: string } = {
    resolve: 'Failed to resolve flag',
    suspend: 'Failed to suspend user',
    deactivate: 'Failed to deactivate user',
    reactivate: 'Failed to reactivate user',
    unsuspend: 'Failed to unsuspend user',
  };
  return actionMap[action] || `Failed to ${action} user`;
}
