import { NextRequest } from 'next/server';
import { createErrorResponse } from '../utils/response-helpers';
import type { Span } from '@sentry/types';
import { ServiceFactory } from '../utils/service-factory';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
}

export interface RateLimitStore {
  increment(
    key: string,
    windowMs: number
  ): Promise<{ count: number; resetTime: number }>;
  get(
    key: string,
    windowMs: number
  ): Promise<{ count: number; resetTime: number } | undefined>;
}

// Redis-based rate limit store using RedisService
class RedisRateLimitStore implements RateLimitStore {
  private redisService = ServiceFactory.createRedisService();

  async increment(
    key: string,
    windowMs: number
  ): Promise<{ count: number; resetTime: number }> {
    try {
      return await this.redisService.incrementRateLimit(key, windowMs);
    } catch (error) {
      console.error('Redis rate limit increment error:', error);
      throw error;
    }
  }

  async get(
    key: string,
    windowMs: number
  ): Promise<{ count: number; resetTime: number } | undefined> {
    try {
      return await this.redisService.getRateLimit(key, windowMs);
    } catch (error) {
      console.error('Redis rate limit get error:', error);
      return undefined;
    }
  }
}

// Simple in-memory store for rate limiting (development fallback)
class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async increment(
    key: string,
    windowMs: number
  ): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      const newEntry = { count: 1, resetTime: now + windowMs };
      this.store.set(key, newEntry);
      return newEntry;
    }

    existing.count++;
    return existing;
  }

  async get(
    key: string
  ): Promise<{ count: number; resetTime: number } | undefined> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      return undefined;
    }

    return existing;
  }
}

function createRateLimitStore(): RateLimitStore {
  // Use Redis in production, in-memory in development
  if (process.env.NODE_ENV === 'production') {
    if (process.env.REDIS_URL) {
      console.log('Using Redis for rate limiting');
      return new RedisRateLimitStore();
    }

    // Fallback to in-memory if Redis is not configured
    console.warn(
      '⚠️  WARNING: Redis not configured, falling back to in-memory rate limiting'
    );
    console.warn(
      '⚠️  In-memory rate limiting is NOT suitable for production with multiple servers!'
    );
    console.warn('⚠️  Please configure REDIS_URL for production use.');
    return new InMemoryRateLimitStore();
  }
  return new InMemoryRateLimitStore();
}

const rateLimitStore = createRateLimitStore();

// Default key generator - uses IP address
function defaultKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `rate-limit:${ip}`;
}

export function withRateLimit(config: RateLimitConfig) {
  return function <T extends unknown[]>(
    handler: (request: NextRequest, ...args: T) => Promise<Response>
  ) {
    return async (request: NextRequest, ...args: T): Promise<Response> => {
      const key = config.keyGenerator
        ? config.keyGenerator(request)
        : defaultKeyGenerator(request);
      const span = args.find(
        (arg): arg is { span: Span } =>
          typeof arg === 'object' && arg !== null && 'span' in arg
      )?.span;

      try {
        const { count, resetTime } = await rateLimitStore.increment(
          key,
          config.windowMs
        );

        span?.setAttribute('rate_limit.count', count);
        span?.setAttribute('rate_limit.limit', config.maxRequests);
        span?.setAttribute('rate_limit.reset_time', resetTime);

        if (count > config.maxRequests) {
          span?.setAttribute('rate_limit.exceeded', true);
          return createErrorResponse(
            'Too many requests',
            429,
            'rate_limit_exceeded',
            {
              retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
              limit: config.maxRequests,
              remaining: 0,
              reset: resetTime,
            }
          );
        }

        const response = await handler(request, ...args);

        // Add rate limit headers
        const headers = new Headers(response.headers);
        headers.set('X-RateLimit-Limit', config.maxRequests.toString());
        headers.set(
          'X-RateLimit-Remaining',
          Math.max(0, config.maxRequests - count).toString()
        );
        headers.set('X-RateLimit-Reset', resetTime.toString());
        headers.set(
          'Retry-After',
          Math.ceil((resetTime - Date.now()) / 1000).toString()
        );

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
      } catch (error) {
        span?.setAttribute('rate_limit.error', true);
        throw error;
      }
    };
  };
}

// Predefined rate limit configurations
export const RATE_LIMIT_CONFIGS = {
  // Standard rate limit for most endpoints
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 300, // 20 requests per minute
  },

  // Rate limit for AI endpoints (more expensive operations)
  ai: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20, // 4 requests per minute
  },

  // Rate limit for authentication (prevent brute force)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 30, // 2 requests per minute
  },

  // Rate limit for file uploads
  upload: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 15, // 3 requests per minute
  },
} as const;
