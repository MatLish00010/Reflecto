import { ServiceFactory } from '@/shared/lib/api/utils/service-factory';

/**
 * Очищает rate limiting состояние для тестов
 * В development использует in-memory store, поэтому просто ждет
 */
export async function cleanupRateLimitState(): Promise<void> {
  // В development используем in-memory store, поэтому просто ждем немного
  // чтобы окно rate limiting истекло
  if (process.env.NODE_ENV !== 'production') {
    // Ждем 5 секунд для in-memory store (больше времени для очистки)
    await new Promise(resolve => setTimeout(resolve, 5000));
    return;
  }

  // В production с Redis можно очистить ключи
  try {
    const redisService = ServiceFactory.createRedisService();
    await redisService.cleanupOldKeys();
  } catch (error) {
    console.warn('Failed to cleanup rate limit state:', error);
  }
}

/**
 * Ждет до истечения текущего окна rate limiting
 */
export async function waitForRateLimitWindow(): Promise<void> {
  // Ждем 65 секунд (чуть больше минуты для тестового endpoint)
  await new Promise(resolve => setTimeout(resolve, 65000));
}
