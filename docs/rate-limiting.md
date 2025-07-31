# Rate Limiting with Redis

## Overview

Rate limiting in the application is implemented using Redis for production and in-memory store for development.

## Redis Setup for Rate Limiting

### Local Development

For local development, create a `.env.local` file:

```env
REDIS_URL=your-redis-url
```

## Usage

### Basic Usage

```typescript
import {
  withRateLimit,
  RATE_LIMIT_CONFIGS,
} from '@/shared/lib/api/middleware/rate-limit';

export const GET = withRateLimit(RATE_LIMIT_CONFIGS.standard)(async (
  request: NextRequest
) => {
  // Your request processing code
  return Response.json({ message: 'Success' });
});
```

### Default Configurations

- **standard**: 300 requests per 15 minutes
- **ai**: 20 requests per 5 minutes (for AI endpoints)
- **auth**: 30 requests per 15 minutes (for authentication)
- **upload**: 15 requests per 5 minutes (for file uploads)

### Custom Configuration

```typescript
const customConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  keyGenerator: (request: NextRequest) => {
    // Custom key generation logic
    const userId = request.headers.get('x-user-id');
    return `user:${userId}`;
  },
};

export const POST = withRateLimit(customConfig)(async (
  request: NextRequest
) => {
  // Your code
});
```

## Architecture

### RedisService

Centralized service for working with Redis, used for:

- **Rate Limiting**: Atomic operations with counters
- **Monitoring**: Getting memory and key statistics
- **Cleanup**: Removing old keys

**Main methods:**

- `incrementRateLimit()` - atomic counter increment
- `getRateLimit()` - get current value
- `getStats()` - complete Redis statistics
- `cleanupOldKeys()` - cleanup old keys

**Memory optimizations:**

- Short keys: `rl:ip:timestamp` instead of `rate_limit:ip:timestamp`
- Automatic deletion via TTL
- ~50 bytes per key (very efficient)
- Singleton pattern via ServiceFactory

### InMemoryRateLimitStore

Fallback for development environment, uses Map for in-memory data storage.

## Memory Usage Monitoring

### Usage calculation:

```typescript
// Example for 1000 active users:
// 1000 keys × 50 bytes = 50KB
// This is very small for a 30MB limit!

// For 10,000 users:
// 10,000 keys × 50 bytes = 500KB
// Still very efficient
```

### Automatic management:

- Keys are automatically deleted via TTL (15 minutes for standard)
- No need for manual cleanup
- Redis automatically frees memory

### Monitoring (optional):

```typescript
import { ServiceFactory } from '@/shared/lib/api/utils/service-factory';

const redisService = ServiceFactory.createRedisService();
const stats = await redisService.getStats();

console.log('Rate limit keys:', stats.rateLimitKeys);
console.log('Memory usage:', stats.memory.usedMemory, 'bytes');
console.log('Memory usage %:', stats.memory.memoryUsagePercent, '%');
```

## Monitoring

Rate limiting is integrated with Sentry for monitoring:

- `rate_limit.count` - current request counter
- `rate_limit.limit` - request limit
- `rate_limit.reset_time` - reset time
- `rate_limit.exceeded` - whether limit was exceeded
- `rate_limit.error` - rate limiting errors

## Headers

Rate limiting adds the following headers to the response:

- `X-RateLimit-Limit` - maximum number of requests
- `X-RateLimit-Remaining` - remaining number of requests
- `X-RateLimit-Reset` - limit reset time
- `Retry-After` - wait time until next request

## Error Handling

When the limit is exceeded, HTTP 429 is returned with JSON response:

```json
{
  "error": "Too many requests",
  "code": "rate_limit_exceeded",
  "details": {
    "retryAfter": 60,
    "limit": 300,
    "remaining": 0,
    "reset": 1640995200000
  }
}
```

## Using RedisService

### Direct service usage

```typescript
import { ServiceFactory } from '@/shared/lib/api/utils/service-factory';

// Get Redis statistics
const redisService = ServiceFactory.createRedisService();
const stats = await redisService.getStats();

// Cleanup old keys
await redisService.cleanupOldKeys();

// Check Redis health
const isHealthy = await redisService.isHealthy();

// Get memory information
const memoryInfo = await redisService.getMemoryInfo();
```

### API Endpoint for Monitoring

Available endpoint `/api/redis-stats` for real-time monitoring:

```bash
curl http://localhost:3000/api/redis-stats
```

Response includes:

- Memory usage
- Number of rate limit keys
- Capacity estimation
- Usage recommendations

## Testing

### Jest Integration Tests

The project includes a complete set of Jest integration tests for rate limiting:

```bash
# Run all integration tests
pnpm test:integration

# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

#### Test structure:

- `tests/integration/rate-limit-basic.test.ts` - basic rate limiting tests
- `tests/integration/rate-limit-ip-isolation.test.ts` - IP isolation tests
- `tests/integration/rate-limit-post.test.ts` - POST endpoint tests

### Test Endpoint

A special endpoint is created for testing rate limiting:

- `GET /api/rate-limit-test` - strict limit (3 requests per minute)
- `POST /api/rate-limit-test` - AI limit (20 requests per 5 minutes)

### Manual Testing

```bash
# Test GET endpoint
curl -i http://localhost:3000/api/rate-limit-test

# Test POST endpoint
curl -i -X POST http://localhost:3000/api/rate-limit-test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Checking Headers

Pay attention to the response headers:

```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1640995200000
Retry-After: 60
```
