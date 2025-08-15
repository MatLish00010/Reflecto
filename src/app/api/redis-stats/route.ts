import { safeSentry } from '@/shared/lib/sentry';
import { ServiceFactory } from '@/shared/lib/api/utils/service-factory';

export async function GET() {
  return safeSentry.startSpan(
    {
      op: 'http.server',
      name: 'GET /api/redis-stats',
    },
    async () => {
      try {
        // Check if Redis is available
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
        safeSentry.captureException(error as Error, {
          tags: { operation: 'get_redis_stats' },
        });

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
