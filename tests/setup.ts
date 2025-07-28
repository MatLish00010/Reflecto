// Global test setup

// Увеличиваем timeout для интеграционных тестов
jest.setTimeout(30000);

// Мокаем Sentry для тестов
jest.mock('@sentry/nextjs', () => ({
  startSpan: jest.fn(
    (
      config: unknown,
      callback: (span: { setAttribute: jest.Mock }) => unknown
    ) => callback({ setAttribute: jest.fn() })
  ),
  captureException: jest.fn(),
}));
