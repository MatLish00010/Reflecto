import { API_CONFIG } from './api';
import { ENV } from './environment';

export function validateEnvironment() {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
  ];

  const missing = required.filter(key => !ENV[key as keyof typeof ENV]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  if (ENV.NODE_ENV === 'production') {
    if (!ENV.REDIS_URL) {
      console.warn(
        '⚠️  REDIS_URL not set in production. Rate limiting will use in-memory store.'
      );
    }

    if (!ENV.SENTRY_DSN) {
      console.warn(
        '⚠️  SENTRY_DSN not set in production. Error tracking will be disabled.'
      );
    }
  }
}

export function validateApiConfig() {
  const endpoints = Object.values(API_CONFIG.ENDPOINTS);

  for (const endpoint of endpoints) {
    if (
      typeof endpoint === 'string' &&
      !endpoint.startsWith('/api/') &&
      !endpoint.startsWith('/auth/')
    ) {
      console.warn(
        `⚠️  API endpoint should start with /api/ or /auth/: ${endpoint}`
      );
    }
  }
}
