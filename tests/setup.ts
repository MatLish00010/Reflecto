// Global test setup

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock Sentry for tests
jest.mock('@sentry/nextjs', () => ({
  startSpan: jest.fn(
    (
      config: unknown,
      callback: (span: { setAttribute: jest.Mock }) => unknown
    ) => callback({ setAttribute: jest.fn() })
  ),
  captureException: jest.fn(),
}));
