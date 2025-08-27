export const API_CONFIG = {
  // Endpoints
  ENDPOINTS: {
    NOTES: '/api/notes',
    DAILY_SUMMARY: '/api/daily-summary',
    DAILY_SUMMARIES: '/api/daily-summaries',
    WEEKLY_SUMMARY: '/api/weekly-summary',
    WEEKLY_SUMMARIES: '/api/weekly-summaries',
    FEEDBACK: '/api/feedback',
    SPEECH_TO_TEXT: '/api/speech-to-text',
    SUBSCRIPTIONS: '/api/subscriptions',
    STRIPE: {
      PRODUCTS: '/api/stripe/products',
      CHECKOUT: '/api/stripe/create-checkout-session',
      PORTAL: '/api/stripe/create-portal-session',
      WEBHOOK: '/api/stripe/webhook',
    },
    AUTH: {
      CALLBACK: '/auth/callback',
    },
  },

  // Error Messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Authentication required',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'Resource not found',
    RATE_LIMIT_EXCEEDED: 'Too many requests',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service unavailable',
    OPENAI_QUOTA_EXCEEDED: 'OpenAI quota exceeded',
    OPENAI_INVALID_KEY: 'Invalid OpenAI API key',
    ENCRYPTION_FAILED: 'Failed to encrypt data',
    DECRYPTION_FAILED: 'Failed to decrypt data',
  },

  // HTTP Status Codes
  STATUS_CODES: {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },
} as const;

export type ApiConfig = typeof API_CONFIG;
