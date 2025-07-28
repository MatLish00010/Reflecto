# Rate Limiting с Redis

## Обзор

Rate limiting в приложении реализован с использованием Redis для production и in-memory store для development.

## Настройка Redis для Rate Limiting

### Локальная разработка

Для локальной разработки создайте файл `.env.local`:

```env
REDIS_URL=your-redis-url
```

## Использование

### Базовое использование

```typescript
import {
  withRateLimit,
  RATE_LIMIT_CONFIGS,
} from '@/shared/lib/api/middleware/rate-limit';

export const GET = withRateLimit(RATE_LIMIT_CONFIGS.standard)(async (
  request: NextRequest
) => {
  // Ваш код обработки запроса
  return Response.json({ message: 'Success' });
});
```

### Конфигурации по умолчанию

- **standard**: 300 запросов за 15 минут
- **ai**: 20 запросов за 5 минут (для AI endpoints)
- **auth**: 30 запросов за 15 минут (для аутентификации)
- **upload**: 15 запросов за 5 минут (для загрузки файлов)

### Кастомная конфигурация

```typescript
const customConfig = {
  windowMs: 60 * 1000, // 1 минута
  maxRequests: 10, // 10 запросов в минуту
  keyGenerator: (request: NextRequest) => {
    // Кастомная логика генерации ключа
    const userId = request.headers.get('x-user-id');
    return `user:${userId}`;
  },
};

export const POST = withRateLimit(customConfig)(async (
  request: NextRequest
) => {
  // Ваш код
});
```

## Архитектура

### RedisService

Централизованный сервис для работы с Redis, который используется для:

- **Rate Limiting**: Атомарные операции с счетчиками
- **Мониторинг**: Получение статистики памяти и ключей
- **Очистка**: Удаление старых ключей

**Основные методы:**

- `incrementRateLimit()` - атомарное увеличение счетчика
- `getRateLimit()` - получение текущего значения
- `getStats()` - полная статистика Redis
- `cleanupOldKeys()` - очистка старых ключей

**Оптимизации памяти:**

- Короткие ключи: `rl:ip:timestamp` вместо `rate_limit:ip:timestamp`
- Автоматическое удаление через TTL
- ~50 байт на ключ (очень эффективно)
- Singleton паттерн через ServiceFactory

### InMemoryRateLimitStore

Fallback для development окружения, использует Map для хранения данных в памяти.

## Мониторинг использования памяти

### Расчет использования:

```typescript
// Пример для 1000 активных пользователей:
// 1000 ключей × 50 байт = 50KB
// Это очень мало для 30MB лимита!

// Для 10,000 пользователей:
// 10,000 ключей × 50 байт = 500KB
// Все еще очень эффективно
```

### Автоматическое управление:

- Ключи автоматически удаляются через TTL (15 минут для standard)
- Нет необходимости в ручной очистке
- Redis автоматически освобождает память

### Мониторинг (опционально):

```typescript
import { ServiceFactory } from '@/shared/lib/api/utils/service-factory';

const redisService = ServiceFactory.createRedisService();
const stats = await redisService.getStats();

console.log('Rate limit keys:', stats.rateLimitKeys);
console.log('Memory usage:', stats.memory.usedMemory, 'bytes');
console.log('Memory usage %:', stats.memory.memoryUsagePercent, '%');
```

## Мониторинг

Rate limiting интегрирован с Sentry для мониторинга:

- `rate_limit.count` - текущий счетчик запросов
- `rate_limit.limit` - лимит запросов
- `rate_limit.reset_time` - время сброса
- `rate_limit.exceeded` - превышен ли лимит
- `rate_limit.error` - ошибки в работе rate limiting

## Headers

Rate limiting добавляет следующие заголовки к ответу:

- `X-RateLimit-Limit` - максимальное количество запросов
- `X-RateLimit-Remaining` - оставшееся количество запросов
- `X-RateLimit-Reset` - время сброса лимита
- `Retry-After` - время ожидания до следующего запроса

## Обработка ошибок

При превышении лимита возвращается HTTP 429 с JSON ответом:

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

## Использование RedisService

### Прямое использование сервиса

```typescript
import { ServiceFactory } from '@/shared/lib/api/utils/service-factory';

// Получение статистики Redis
const redisService = ServiceFactory.createRedisService();
const stats = await redisService.getStats();

// Очистка старых ключей
await redisService.cleanupOldKeys();

// Проверка здоровья Redis
const isHealthy = await redisService.isHealthy();

// Получение информации о памяти
const memoryInfo = await redisService.getMemoryInfo();
```

### API Endpoint для мониторинга

Доступен endpoint `/api/redis-stats` для мониторинга в реальном времени:

```bash
curl http://localhost:3000/api/redis-stats
```

Ответ включает:

- Использование памяти
- Количество rate limit ключей
- Оценку емкости
- Рекомендации по использованию

## Тестирование

### Jest Интеграционные Тесты

Проект включает полный набор Jest интеграционных тестов для rate limiting:

```bash
# Запуск всех интеграционных тестов
pnpm test:integration

# Запуск всех тестов
pnpm test

# Запуск тестов с покрытием
pnpm test:coverage

# Запуск тестов в watch режиме
pnpm test:watch
```

#### Структура тестов:

- `tests/integration/rate-limit-basic.test.ts` - базовые тесты rate limiting
- `tests/integration/rate-limit-ip-isolation.test.ts` - тесты изоляции по IP
- `tests/integration/rate-limit-post.test.ts` - тесты POST endpoints

### Тестовый Endpoint

Создан специальный endpoint для тестирования rate limiting:

- `GET /api/rate-limit-test` - строгий лимит (3 запроса в минуту)
- `POST /api/rate-limit-test` - AI лимит (20 запросов за 5 минут)

### Ручное тестирование

```bash
# Тест GET endpoint
curl -i http://localhost:3000/api/rate-limit-test

# Тест POST endpoint
curl -i -X POST http://localhost:3000/api/rate-limit-test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Проверка Headers

Обратите внимание на заголовки ответа:

```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1640995200000
Retry-After: 60
```
