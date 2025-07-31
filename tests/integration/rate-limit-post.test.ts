// Jest globals are available without import in test files
import { cleanupRateLimitState } from '../utils/rate-limit-cleanup';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Rate Limiting POST Tests', () => {
  beforeEach(async () => {
    // Clean up state before each test
    jest.clearAllMocks();
    await cleanupRateLimitState();
  });

  afterEach(async () => {
    // Clean up state after each test
    await cleanupRateLimitState();
  });

  describe('POST /api/rate-limit-test', () => {
    it('should use AI rate limit configuration', async () => {
      const testData = { test: true, timestamp: new Date().toISOString() };

      const response = await fetch(`${BASE_URL}/api/rate-limit-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('X-RateLimit-Limit')).toBe('20');
      expect(response.headers.get('X-RateLimit-Remaining')).toBeTruthy();

      const data = await response.json();
      expect(data.message).toBe('AI rate limit test successful');
      expect(data.processedData).toEqual(testData);
    });

    it('should handle multiple POST requests correctly', async () => {
      const results = [];

      // Execute 3 POST requests
      for (let i = 1; i <= 3; i++) {
        const response = await fetch(`${BASE_URL}/api/rate-limit-test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ iteration: i }),
        });

        const data = await response.json();
        results.push({
          request: i,
          status: response.status,
          limit: response.headers.get('X-RateLimit-Limit'),
          remaining: response.headers.get('X-RateLimit-Remaining'),
          data,
        });
      }

      // All requests should succeed (limit 20 requests per 5 minutes)
      results.forEach((result, index) => {
        expect(result.status).toBe(200);
        expect(result.limit).toBe('20');
        expect(result.data.message).toBe('AI rate limit test successful');
        expect(result.data.processedData.iteration).toBe(index + 1);
      });
    });
  });
});
