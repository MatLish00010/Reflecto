import * as Sentry from '@sentry/nextjs';
import type { NextRequest } from 'next/server';
import {
  RATE_LIMIT_CONFIGS,
  withRateLimit,
} from '@/shared/common/lib/api/middleware/rate-limit';

// Test endpoint with very strict rate limit for demonstration
const strictConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3, // only 3 requests per minute
  keyGenerator: (request: NextRequest) => {
    // Use IP address for demonstration
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return `test:${ip}`;
  },
};

export const GET = withRateLimit(strictConfig)(async () => {
  // Create span for monitoring
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'Rate Limit Test',
    },
    async span => {
      span.setAttribute('endpoint', '/api/rate-limit-test');
      span.setAttribute('method', 'GET');

      // Simulate some processing
      await new Promise(resolve => setTimeout(resolve, 100));

      return Response.json({
        message: 'Rate limit test successful',
        timestamp: new Date().toISOString(),
        remainingRequests: 'Check X-RateLimit-Remaining header',
      });
    }
  );
});

// Endpoint with AI rate limit for demonstrating different configurations
export const POST = withRateLimit(RATE_LIMIT_CONFIGS.ai)(
  async (request: NextRequest) => {
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

        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 500));

        return Response.json({
          message: 'AI rate limit test successful',
          timestamp: new Date().toISOString(),
          processedData: body,
        });
      }
    );
  }
);
