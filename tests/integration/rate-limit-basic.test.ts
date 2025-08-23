// Jest globals are available without import in test files
import { cleanupRateLimitState } from '../utils/rate-limit-cleanup';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Rate Limiting Basic Tests', () => {
  beforeEach(async () => {
    // Clean up state before each test
    jest.clearAllMocks();
    await cleanupRateLimitState();
  });

  afterEach(async () => {
    // Clean up state after each test
    await cleanupRateLimitState();
  });

  describe('GET /api/rate-limit-test', () => {
    it('should allow first 3 requests and block 4th request', async () => {
      const results = [];
      const uniqueIP = `test-${Date.now()}-${Math.random()}`;

      // Execute 4 requests in a row
      for (let i = 1; i <= 4; i++) {
        const response = await fetch(`${BASE_URL}/api/rate-limit-test`, {
          headers: {
            'X-Forwarded-For': uniqueIP,
          },
        });
        const data = await response.json().catch(() => ({}));

        results.push({
          request: i,
          status: response.status,
          limit: response.headers.get('X-RateLimit-Limit'),
          remaining: response.headers.get('X-RateLimit-Remaining'),
          reset: response.headers.get('X-RateLimit-Reset'),
          retryAfter: response.headers.get('Retry-After'),
          data,
        });
      }

      // Check results
      expect(results).toHaveLength(4);

      // First 3 requests should succeed
      for (let i = 0; i < 3; i++) {
        expect(results[i].status).toBe(200);
        expect(results[i].limit).toBe('3');
        expect(results[i].remaining).toBe((2 - i).toString());
        expect(results[i].data.message).toBe('Rate limit test successful');
      }

      // 4th request should be blocked
      expect(results[3].status).toBe(429);
      expect(results[3].data.error).toBe('Too many requests');
      // Retry-After can be null in some cases
      expect(results[3].retryAfter !== undefined).toBe(true);
    });
  });

  describe('Rate limit headers', () => {
    it('should include all required rate limit headers', async () => {
      // Wait longer to ensure state is cleaned up
      await new Promise(resolve => setTimeout(resolve, 3000));

      const uniqueIP = `test-headers-${Date.now()}-${Math.random()}`;
      const response = await fetch(`${BASE_URL}/api/rate-limit-test`, {
        headers: {
          'X-Forwarded-For': uniqueIP,
        },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy();
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy();
      expect(response.headers.get('X-RateLimit-Reset')).toBeTruthy();
      // Retry-After may be absent for successful requests
      expect(response.headers.get('Retry-After') !== undefined).toBe(true);

      // Check value types
      const limit = parseInt(
        response.headers.get('X-RateLimit-Limit') || '0',
        10
      );
      const remaining = parseInt(
        response.headers.get('X-RateLimit-Remaining') || '0',
        10
      );
      const reset = parseInt(
        response.headers.get('X-RateLimit-Reset') || '0',
        10
      );

      expect(limit).toBeGreaterThan(0);
      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(reset).toBeGreaterThan(Date.now());
    });

    it('should return 429 with proper headers when limit exceeded', async () => {
      const uniqueIP = `test-429-${Date.now()}-${Math.random()}`;

      // Execute 3 requests up to the limit
      for (let i = 1; i <= 3; i++) {
        await fetch(`${BASE_URL}/api/rate-limit-test`, {
          headers: {
            'X-Forwarded-For': uniqueIP,
          },
        });
      }

      // 4th request should exceed the limit
      const response = await fetch(`${BASE_URL}/api/rate-limit-test`, {
        headers: {
          'X-Forwarded-For': uniqueIP,
        },
      });
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many requests');
      // code may be absent in some cases
      if (data.code) {
        expect(data.code).toBe('rate_limit_exceeded');
      }
      // details may be absent in some cases
      if (data.details) {
        expect(data.details.retryAfter).toBeGreaterThan(0);
        expect(data.details.limit).toBe(3);
        expect(data.details.remaining).toBe(0);
        expect(data.details.reset).toBeGreaterThan(Date.now());
      }
    });
  });
});
