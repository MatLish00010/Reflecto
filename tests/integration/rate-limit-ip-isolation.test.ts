// Jest globals are available without import in test files
import { cleanupRateLimitState } from '../utils/rate-limit-cleanup';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Rate Limiting IP Isolation Tests', () => {
  beforeEach(async () => {
    // Clean up state before each test
    jest.clearAllMocks();
    await cleanupRateLimitState();
  });

  afterEach(async () => {
    // Clean up state after each test
    await cleanupRateLimitState();
  });

  describe('Rate limiting with different IP addresses', () => {
    it('should isolate rate limits by IP address', async () => {
      const testIPs = ['192.168.1.1', '192.168.1.2', '10.0.0.1'];
      const results = [];

      // Execute requests with different IP addresses
      for (const ip of testIPs) {
        const ipResults = [];

        for (let i = 1; i <= 4; i++) {
          const response = await fetch(`${BASE_URL}/api/rate-limit-test`, {
            headers: {
              'X-Forwarded-For': ip,
            },
          });

          const data = await response.json().catch(() => ({}));
          ipResults.push({
            request: i,
            status: response.status,
            remaining: response.headers.get('X-RateLimit-Remaining'),
            data,
          });
        }

        results.push({ ip, results: ipResults });
      }

      // Check that each IP has its own counter
      results.forEach(({ results: ipResults }) => {
        // First 3 requests should succeed
        for (let i = 0; i < 3; i++) {
          expect(ipResults[i].status).toBe(200);
          expect(ipResults[i].remaining).toBe((2 - i).toString());
        }

        // 4th request should be blocked
        expect(ipResults[3].status).toBe(429);
        expect(ipResults[3].data.error).toBe('Too many requests');
      });
    });
  });
});
