import * as Sentry from '@sentry/nextjs';
import { ServiceFactory } from '@/shared/lib/api/utils/service-factory';

export async function GET() {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/redis-stats',
    },
    async () => {
      try {
        // Проверяем, что Redis доступен
        if (!process.env.REDIS_URL) {
          return Response.json(
            {
              error: 'Redis not configured',
              message: 'This endpoint requires REDIS_URL configuration',
            },
            { status: 503 }
          );
        }

        const redisService = ServiceFactory.createRedisService();
        const stats = await redisService.getStats();

        return Response.json({
          ...stats,
          capacity: {
            maxKeys: stats.memory.estimatedCapacity,
            usagePercentage:
              Math.round(stats.memory.memoryUsagePercent * 100) / 100,
            estimatedMaxUsers: stats.memory.estimatedCapacity,
          },
          recommendations: {
            low: stats.memory.memoryUsagePercent < 10,
            medium:
              stats.memory.memoryUsagePercent >= 10 &&
              stats.memory.memoryUsagePercent < 50,
            high: stats.memory.memoryUsagePercent >= 50,
          },
        });
      } catch (error) {
        console.error('Failed to get Redis stats:', error);
        Sentry.captureException(error);

        return Response.json(
          {
            error: 'Failed to get Redis stats',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }
  );
}
