// Jest globals are available without import in test files
import { cleanupRateLimitState } from '../utils/rate-limit-cleanup';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Rate Limiting IP Isolation Tests', () => {
  beforeEach(async () => {
    // Очищаем состояние перед каждым тестом
    jest.clearAllMocks();
    await cleanupRateLimitState();
  });

  afterEach(async () => {
    // Очищаем состояние после каждого теста
    await cleanupRateLimitState();
  });

  describe('Rate limiting with different IP addresses', () => {
    it('should isolate rate limits by IP address', async () => {
      const testIPs = ['192.168.1.1', '192.168.1.2', '10.0.0.1'];
      const results = [];

      // Выполняем запросы с разными IP адресами
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

      // Проверяем, что каждый IP имеет свой счетчик
      results.forEach(({ results: ipResults }) => {
        // Первые 3 запроса должны пройти успешно
        for (let i = 0; i < 3; i++) {
          expect(ipResults[i].status).toBe(200);
          expect(ipResults[i].remaining).toBe((2 - i).toString());
        }

        // 4-й запрос должен быть заблокирован
        expect(ipResults[3].status).toBe(429);
        expect(ipResults[3].data.error).toBe('Too many requests');
      });
    });
  });
});
