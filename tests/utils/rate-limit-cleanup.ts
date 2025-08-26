import { ServiceFactory } from '@/shared/common/lib/api/utils/service-factory';

/**
 * Cleans up rate limiting state for tests
 * In development uses in-memory store, so just waits
 */
export async function cleanupRateLimitState(): Promise<void> {
  // In development we use in-memory store, so just wait a bit
  // for the rate limiting window to expire
  if (process.env.NODE_ENV !== 'production') {
    // Wait 5 seconds for in-memory store (more time for cleanup)
    await new Promise(resolve => setTimeout(resolve, 5000));
    return;
  }

  // In production with Redis we can clear keys
  try {
    const redisService = ServiceFactory.createRedisService();
    await redisService.cleanupOldKeys();
  } catch (error) {
    console.warn('Failed to cleanup rate limit state:', error);
  }
}

/**
 * Waits until the current rate limiting window expires
 */
export async function waitForRateLimitWindow(): Promise<void> {
  // Wait 65 seconds (slightly more than a minute for the test endpoint)
  await new Promise(resolve => setTimeout(resolve, 65000));
}
