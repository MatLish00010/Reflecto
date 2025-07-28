import { createClient, type RedisClientType } from 'redis';
import { safeSentry } from '@/shared/lib/sentry';
import type { Span } from '@sentry/types';

export interface RedisServiceOptions {
  span?: Span;
  operation?: string;
}

export interface RateLimitData {
  count: number;
  resetTime: number;
}

export interface RedisMemoryInfo {
  usedMemory: number;
  peakMemory: number;
  totalKeys: number;
  rateLimitKeys: number;
  estimatedCapacity: number;
  memoryUsagePercent: number;
}

export interface RedisStats {
  memory: RedisMemoryInfo;
  rateLimitKeys: number;
  isHealthy: boolean;
}

export class RedisService {
  private client: RedisClientType | null = null;
  private isConnecting = false;

  constructor(private redisUrl?: string) {
    this.redisUrl = redisUrl || process.env.REDIS_URL;
  }

  private async getClient(): Promise<RedisClientType> {
    if (!this.redisUrl) {
      throw new Error('Redis URL not configured');
    }

    if (!this.client) {
      this.client = createClient({
        url: this.redisUrl,
      });
    }

    if (!this.client.isOpen && !this.isConnecting) {
      this.isConnecting = true;
      try {
        await this.client.connect();
      } finally {
        this.isConnecting = false;
      }
    }

    return this.client;
  }

  async disconnect(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.disconnect();
      this.client = null;
    }
  }

  // Rate Limiting Methods
  async incrementRateLimit(
    key: string,
    windowMs: number,
    options: RedisServiceOptions = {}
  ): Promise<RateLimitData> {
    const { span, operation = 'increment_rate_limit' } = options;
    const now = Date.now();
    const resetTime = now + windowMs;
    const windowKey = `rl:${key}:${Math.floor(now / windowMs)}`;

    try {
      const client = await this.getClient();
      const count = await client.incr(windowKey);

      // Set expiration if this is the first request in the window
      if (count === 1) {
        await client.expire(windowKey, Math.ceil(windowMs / 1000));
      }

      span?.setAttribute('redis.rate_limit.count', count);
      span?.setAttribute('redis.rate_limit.key', windowKey);
      span?.setAttribute('redis.rate_limit.window_ms', windowMs);

      return { count, resetTime };
    } catch (error) {
      safeSentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          tags: { operation },
          extra: { key, windowMs },
        }
      );
      throw error;
    }
  }

  async getRateLimit(
    key: string,
    windowMs: number,
    options: RedisServiceOptions = {}
  ): Promise<RateLimitData | undefined> {
    const { span, operation = 'get_rate_limit' } = options;
    const now = Date.now();
    const windowKey = `rl:${key}:${Math.floor(now / windowMs)}`;

    try {
      const client = await this.getClient();
      const count = await client.get(windowKey);

      if (count === null || count === undefined) {
        return undefined;
      }

      const resetTime = now + windowMs;
      span?.setAttribute('redis.rate_limit.count', Number(count));
      span?.setAttribute('redis.rate_limit.key', String(windowKey));

      return { count: parseInt(String(count)), resetTime };
    } catch (error) {
      safeSentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          tags: { operation },
          extra: { key, windowMs },
        }
      );
      return undefined;
    }
  }

  // Monitoring Methods
  async getMemoryInfo(
    options: RedisServiceOptions = {}
  ): Promise<RedisMemoryInfo> {
    const { span, operation = 'get_memory_info' } = options;

    try {
      const client = await this.getClient();
      const memoryInfo = await client.info('memory');

      // Parse memory info
      const usedMemory = parseInt(
        memoryInfo.match(/used_memory:(\d+)/)?.[1] || '0'
      );
      const peakMemory = parseInt(
        memoryInfo.match(/used_memory_peak:(\d+)/)?.[1] || '0'
      );

      // Get total keys
      const dbInfo = await client.info('keyspace');
      const totalKeys = parseInt(dbInfo.match(/keys=(\d+)/)?.[1] || '0');

      // Get rate limit keys
      const rateLimitKeys = await this.getRateLimitKeysCount();

      // Calculate capacity (assuming 30MB limit for free tier)
      const maxMemory = 30 * 1024 * 1024; // 30MB in bytes
      const memoryUsagePercent = (usedMemory / maxMemory) * 100;
      const estimatedCapacity = Math.floor(maxMemory / 50); // ~50 bytes per key

      span?.setAttribute('redis.memory.used', usedMemory);
      span?.setAttribute('redis.memory.peak', peakMemory);
      span?.setAttribute('redis.memory.usage_percent', memoryUsagePercent);
      span?.setAttribute('redis.keys.total', totalKeys);
      span?.setAttribute('redis.keys.rate_limit', rateLimitKeys);

      return {
        usedMemory,
        peakMemory,
        totalKeys,
        rateLimitKeys,
        estimatedCapacity,
        memoryUsagePercent,
      };
    } catch (error) {
      safeSentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          tags: { operation },
        }
      );
      throw error;
    }
  }

  async getRateLimitKeysCount(
    options: RedisServiceOptions = {}
  ): Promise<number> {
    const { span, operation = 'get_rate_limit_keys_count' } = options;

    try {
      const client = await this.getClient();
      const keys = await client.keys('rl:*');
      const count = keys.length;

      span?.setAttribute('redis.rate_limit_keys.count', count);
      return count;
    } catch (error) {
      safeSentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          tags: { operation },
        }
      );
      return 0;
    }
  }

  async cleanupOldKeys(options: RedisServiceOptions = {}): Promise<number> {
    const { span, operation = 'cleanup_old_keys' } = options;

    try {
      const client = await this.getClient();
      const keys = await client.keys('rl:*');

      if (keys.length === 0) {
        return 0;
      }

      const deleted = await client.del(keys);

      span?.setAttribute('redis.cleanup.deleted_keys', deleted);
      return deleted;
    } catch (error) {
      safeSentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          tags: { operation },
        }
      );
      return 0;
    }
  }

  async getStats(options: RedisServiceOptions = {}): Promise<RedisStats> {
    const { span, operation = 'get_redis_stats' } = options;

    try {
      const memory = await this.getMemoryInfo({
        span,
        operation: 'get_memory_info',
      });
      const rateLimitKeys = await this.getRateLimitKeysCount({
        span,
        operation: 'get_rate_limit_keys_count',
      });

      // Consider healthy if memory usage is under 80%
      const isHealthy = memory.memoryUsagePercent < 80;

      span?.setAttribute('redis.health.is_healthy', isHealthy);

      return {
        memory,
        rateLimitKeys,
        isHealthy,
      };
    } catch (error) {
      safeSentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          tags: { operation },
        }
      );

      // Return default stats on error
      return {
        memory: {
          usedMemory: 0,
          peakMemory: 0,
          totalKeys: 0,
          rateLimitKeys: 0,
          estimatedCapacity: 0,
          memoryUsagePercent: 0,
        },
        rateLimitKeys: 0,
        isHealthy: false,
      };
    }
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      const client = await this.getClient();
      await client.ping();
      return true;
    } catch (error) {
      safeSentry.captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          tags: { operation: 'redis_health_check' },
        }
      );
      return false;
    }
  }
}
