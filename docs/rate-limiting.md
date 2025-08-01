# Rate Limiting

This document describes the rate limiting implementation and how to troubleshoot issues.

## Overview

The application uses a flexible rate limiting system that supports both Redis (production) and in-memory storage (development).

## Configuration

Rate limiting is configured in `src/shared/lib/api/middleware/rate-limit.ts` with predefined configurations:

- **Standard**: 300 requests per 15 minutes
- **AI**: 20 requests per 5 minutes (for expensive operations)
- **Auth**: 30 requests per 15 minutes (for authentication)
- **Upload**: 15 requests per 5 minutes (for file uploads)

## Troubleshooting

### Issue: Rate Limit Exceeded Without Making Requests

If you're getting rate limit errors without making requests, this could be due to:

1. **In-memory store persistence**: The in-memory store persists between server restarts in development
2. **IP address detection issues**: The system might not be detecting your IP correctly
3. **Shared keys**: Multiple requests might be using the same rate limit key

### Solutions

#### 1. Clear Rate Limit Store (Development)

```bash
# Clear the in-memory rate limit store
curl -X DELETE http://localhost:3000/api/redis-stats
```

#### 2. Check Rate Limit Status

```bash
# Check current rate limit status
curl http://localhost:3000/api/rate-limit-test
```

#### 3. Run Integration Tests

```bash
# Run all integration tests
pnpm test:integration

# Run specific rate limit tests
pnpm test tests/integration/rate-limit-basic.test.ts
pnpm test tests/integration/rate-limit-ip-isolation.test.ts
pnpm test tests/integration/rate-limit-post.test.ts
```

#### 4. Debug Logging

In development mode, the rate limiting middleware logs:

- Rate limit keys being used
- Current count vs limit
- When rate limits are exceeded

Check the console output for these debug messages.

### IP Address Detection

The system tries to detect your IP address from these headers in order:

1. `x-forwarded-for`
2. `x-real-ip`
3. `cf-connecting-ip`

In development, if no IP is detected, it falls back to using a hash of the user agent.

### Development vs Production

- **Development**: Uses in-memory storage (persists between requests but not server restarts)
- **Production**: Uses Redis (requires `REDIS_URL` environment variable)

## API Endpoints

### Rate Limit Test

- `GET /api/rate-limit-test` - Check rate limit status
- `POST /api/rate-limit-test` - Test rate limiting (uses AI config)

### Redis Stats

- `GET /api/redis-stats` - Get Redis statistics
- `DELETE /api/redis-stats` - Clear rate limit store (development only)

## Testing

The project includes comprehensive integration tests for rate limiting:

### Test Files

- `tests/integration/rate-limit-basic.test.ts` - Basic rate limiting functionality
- `tests/integration/rate-limit-ip-isolation.test.ts` - IP isolation tests
- `tests/integration/rate-limit-post.test.ts` - POST endpoint rate limiting

### Running Tests

```bash
# Run all integration tests
pnpm test:integration

# Run specific rate limit tests
pnpm test tests/integration/rate-limit-basic.test.ts

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Test Features

- Automatic cleanup between tests
- IP isolation testing
- Header validation
- Error response validation
- Rate limit state management

## Monitoring

Rate limiting is integrated with Sentry for monitoring:

- Rate limit counts are tracked as span attributes
- Rate limit exceeded events are captured
- Errors in rate limiting are logged

## Best Practices

1. **Use appropriate rate limit configs**: Use `ai` config for expensive operations
2. **Monitor rate limits**: Check Sentry for rate limit patterns
3. **Clear store in development**: Use the DELETE endpoint to reset rate limits during development
4. **Run integration tests**: Use the existing test suite to verify rate limiting works correctly
5. **Check debug logs**: Monitor console output in development for rate limit debugging
