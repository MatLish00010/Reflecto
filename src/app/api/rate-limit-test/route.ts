import { NextRequest } from 'next/server';
import {
  withRateLimit,
  RATE_LIMIT_CONFIGS,
} from '@/shared/lib/api/middleware/rate-limit';
import * as Sentry from '@sentry/nextjs';

// Тестовый endpoint с очень строгим rate limit для демонстрации
const strictConfig = {
  windowMs: 60 * 1000, // 1 минута
  maxRequests: 3, // только 3 запроса в минуту
  keyGenerator: (request: NextRequest) => {
    // Используем IP адрес для демонстрации
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return `test:${ip}`;
  },
};

export const GET = withRateLimit(strictConfig)(async () => {
  // Создаем span для мониторинга
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'Rate Limit Test',
    },
    async span => {
      span.setAttribute('endpoint', '/api/rate-limit-test');
      span.setAttribute('method', 'GET');

      // Имитируем некоторую обработку
      await new Promise(resolve => setTimeout(resolve, 100));

      return Response.json({
        message: 'Rate limit test successful',
        timestamp: new Date().toISOString(),
        remainingRequests: 'Check X-RateLimit-Remaining header',
      });
    }
  );
});

// Endpoint с AI rate limit для демонстрации разных конфигураций
export const POST = withRateLimit(RATE_LIMIT_CONFIGS.ai)(async (
  request: NextRequest
) => {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'AI Rate Limit Test',
    },
    async span => {
      span.setAttribute('endpoint', '/api/rate-limit-test');
      span.setAttribute('method', 'POST');

      const body = await request.json();
      span.setAttribute('request.body_size', JSON.stringify(body).length);

      // Имитируем AI обработку
      await new Promise(resolve => setTimeout(resolve, 500));

      return Response.json({
        message: 'AI rate limit test successful',
        timestamp: new Date().toISOString(),
        processedData: body,
      });
    }
  );
});
