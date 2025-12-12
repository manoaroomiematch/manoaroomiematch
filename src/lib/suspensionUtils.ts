/**
 * Suspension Management Utilities
 * Handles automatic reactivation of suspended users after their suspension period expires
 */
import { prisma } from '@/lib/prisma';

// NOTE: Module-level timing state is not suitable for serverless environments
// where multiple instances may be running concurrently. Consider using
// a database-based locking mechanism for distributed deployments.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run at most once every 5 minutes
let lastCleanupTime = 0;

/**
 * Clears expired suspensions for all users
 * Optimized to:
 * - Run asynchronously (non-blocking)
 * - Skip if run recently (within 5 minutes)
 * - Use single database query instead of find + update
 * - Auto-resolve flags when suspension expires
 *
 * SERVERLESS NOTE: In serverless environments, consider using a database-based
 * locking mechanism or accepting that cleanup may run more frequently across instances.
 */
export async function clearExpiredSuspensions() {
  try {
    const now = Date.now();

    // Skip if we ran cleanup recently (local instance check only)
    if (now - lastCleanupTime < CLEANUP_INTERVAL_MS) {
      return 0;
    }

    lastCleanupTime = now;

    // Get users with expired suspensions to find their associated flags
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expiredUsers = await (prisma as any).user.findMany({
      where: {
        suspendedUntil: {
          not: null,
          lt: new Date(),
        },
        active: true,
      },
      select: {
        id: true,
      },
    });

    // Auto-resolve any active flags for users with expired suspensions
    if (expiredUsers.length > 0) {
      const userIds = expiredUsers.map((u: any) => u.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).flag.updateMany({
        where: {
          reported_user_id: {
            in: userIds,
          },
          status: 'suspended',
        },
        data: {
          status: 'resolved',
        },
      });
    }

    // Single query to update all expired suspensions at once
    const result = await prisma.user.updateMany({
      where: {
        suspendedUntil: {
          not: null,
          lt: new Date(),
        },
        active: true,
      },
      data: {
        suspendedUntil: null,
      },
    });

    if (result.count > 0) {
      console.log(`[SuspensionCleanup] Cleared ${result.count} expired suspensions and auto-resolved associated flags`);
    }

    return result.count;
  } catch (error) {
    console.error('[SuspensionCleanup] Error clearing expired suspensions:', error);
    return 0;
  }
}

/**
 * Async version of clearExpiredSuspensions that doesn't block
 * Call this from middleware to avoid blocking requests
 */
export function clearExpiredSuspensionsAsync() {
  // Fire and forget - don't await
  clearExpiredSuspensions().catch((err) => {
    console.error('[SuspensionCleanup] Async error:', err);
  });
}

/**
 * Checks if a user's suspension has expired and returns the current suspension status
 */
export async function checkUserSuspensionStatus(userId: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        suspendedUntil: true,
      },
    });

    if (!user || !user.suspendedUntil) {
      return { suspended: false, suspendedUntil: null };
    }

    const now = new Date();
    const suspended = user.suspendedUntil > now;

    // If suspension has expired, clear it
    if (!suspended) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).user.update({
        where: { id: userId },
        data: { suspendedUntil: null },
      });
    }

    return {
      suspended,
      suspendedUntil: user.suspendedUntil,
    };
  } catch (error) {
    console.error('[SuspensionStatus] Error checking suspension status:', error);
    return { suspended: false, suspendedUntil: null };
  }
}
