/**
 * Centralized configuration for Sentry error filtering
 * This file contains all error patterns that should be ignored or filtered
 */

export interface ErrorFilterConfig {
  message: string | RegExp;
  reason: string;
  tags?: Record<string, string>;
}

export interface ErrorCategory {
  name: string;
  description: string;
  filters: ErrorFilterConfig[];
}

// Auth-related errors that are expected for non-authenticated users
export const AUTH_ERRORS: ErrorCategory = {
  name: 'auth_errors',
  description:
    'Authentication errors that are expected for non-authenticated users',
  filters: [
    {
      message: 'Auth session missing!',
      reason: 'Expected when user is not authenticated',
      tags: { category: 'auth', expected: 'true' },
    },
    {
      message: 'Auth session not found',
      reason: 'Expected when user is not authenticated',
      tags: { category: 'auth', expected: 'true' },
    },
    {
      message: /^Auth.*unauthorized$/i,
      reason: 'Generic auth unauthorized errors',
      tags: { category: 'auth', expected: 'true' },
    },
    {
      message: /^.*401.*$/i,
      reason: 'HTTP 401 Unauthorized errors',
      tags: { category: 'auth', expected: 'true' },
    },
    {
      message: /^.*403.*$/i,
      reason: 'HTTP 403 Forbidden errors',
      tags: { category: 'auth', expected: 'true' },
    },
  ],
};

// Network-related errors that might be temporary
export const NETWORK_ERRORS: ErrorCategory = {
  name: 'network_errors',
  description: 'Network errors that might be temporary or expected',
  filters: [
    {
      message: /^Network.*error$/i,
      reason: 'Generic network errors',
      tags: { category: 'network', expected: 'true' },
    },
    {
      message: /^Failed to fetch$/i,
      reason: 'Fetch API failures',
      tags: { category: 'network', expected: 'true' },
    },
    {
      message: /^.*timeout.*$/i,
      reason: 'Request timeout errors',
      tags: { category: 'network', expected: 'true' },
    },
  ],
};

// Browser-specific errors that are not actionable
export const BROWSER_ERRORS: ErrorCategory = {
  name: 'browser_errors',
  description: 'Browser-specific errors that are not actionable',
  filters: [
    {
      message: /^Script error\.?$/i,
      reason: 'Generic script errors from external scripts',
      tags: { category: 'browser', expected: 'true' },
    },
    {
      message: /^ResizeObserver loop limit exceeded$/i,
      reason: 'Browser resize observer limitation',
      tags: { category: 'browser', expected: 'true' },
    },
  ],
};

// Configuration errors that are expected in development
export const CONFIG_ERRORS: ErrorCategory = {
  name: 'config_errors',
  description: 'Configuration errors that are expected in certain environments',
  filters: [
    {
      message: /^.*not configured$/i,
      reason: 'Missing configuration in development or staging',
      tags: { category: 'config', expected: 'true' },
    },
    {
      message: /^.*not set in environment variables$/i,
      reason: 'Missing environment variables',
      tags: { category: 'config', expected: 'true' },
    },
    {
      message: /^Redis URL not configured$/i,
      reason: 'Redis not configured in development',
      tags: { category: 'config', expected: 'true' },
    },
    {
      message: /^OpenAI API key is not configured$/i,
      reason: 'OpenAI API key not configured',
      tags: { category: 'config', expected: 'true' },
    },
  ],
};

// User-related errors that are expected
export const USER_ERRORS: ErrorCategory = {
  name: 'user_errors',
  description: 'User-related errors that are expected in normal operation',
  filters: [
    {
      message: /^User not found$/i,
      reason: "Expected when user is not authenticated or doesn't exist",
      tags: { category: 'user', expected: 'true' },
    },
    {
      message: /^Authentication required$/i,
      reason: 'Expected when user is not authenticated',
      tags: { category: 'user', expected: 'true' },
    },
    {
      message: /^Not authenticated$/i,
      reason: 'Expected when user is not authenticated',
      tags: { category: 'user', expected: 'true' },
    },
    {
      message: /^Unauthorized$/i,
      reason: 'Expected when user lacks permissions',
      tags: { category: 'user', expected: 'true' },
    },
  ],
};

// API-related errors that might be temporary
export const API_ERRORS: ErrorCategory = {
  name: 'api_errors',
  description: 'API-related errors that might be temporary or expected',
  filters: [
    {
      message: /^Failed to fetch.*$/i,
      reason: 'Network or API fetch failures',
      tags: { category: 'api', expected: 'true' },
    },
    {
      message: /^OpenAI quota exceeded$/i,
      reason: 'OpenAI API quota limit reached',
      tags: { category: 'api', expected: 'true' },
    },
    {
      message: /^OpenAI rate limit exceeded$/i,
      reason: 'OpenAI API rate limit reached',
      tags: { category: 'api', expected: 'true' },
    },
    {
      message: /^File too large.*$/i,
      reason: 'File size exceeds limits',
      tags: { category: 'api', expected: 'true' },
    },
    {
      message: /^Invalid OpenAI API key$/i,
      reason: 'OpenAI API key validation failed',
      tags: { category: 'api', expected: 'true' },
    },
  ],
};

// Context errors that are expected in development
export const CONTEXT_ERRORS: ErrorCategory = {
  name: 'context_errors',
  description: 'React context errors that are expected in development',
  filters: [
    {
      message: /^.*must be used within.*Provider$/i,
      reason: 'React context usage outside provider',
      tags: { category: 'context', expected: 'true' },
    },
  ],
};

// All error categories
export const ERROR_CATEGORIES: ErrorCategory[] = [
  AUTH_ERRORS,
  NETWORK_ERRORS,
  BROWSER_ERRORS,
  CONFIG_ERRORS,
  USER_ERRORS,
  API_ERRORS,
  CONTEXT_ERRORS,
];

/**
 * Check if an error should be filtered out from Sentry
 */
export function shouldFilterError(error: Error): boolean {
  const errorMessage = error.message;

  for (const category of ERROR_CATEGORIES) {
    for (const filter of category.filters) {
      if (typeof filter.message === 'string') {
        if (errorMessage.includes(filter.message)) {
          return true;
        }
      } else if (filter.message instanceof RegExp) {
        if (filter.message.test(errorMessage)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Get error category information for a given error
 */
export function getErrorCategory(error: Error): ErrorCategory | null {
  const errorMessage = error.message;

  for (const category of ERROR_CATEGORIES) {
    for (const filter of category.filters) {
      if (typeof filter.message === 'string') {
        if (errorMessage.includes(filter.message)) {
          return category;
        }
      } else if (filter.message instanceof RegExp) {
        if (filter.message.test(errorMessage)) {
          return category;
        }
      }
    }
  }

  return null;
}

/**
 * Get filter information for a given error
 */
export function getErrorFilter(error: Error): ErrorFilterConfig | null {
  const errorMessage = error.message;

  for (const category of ERROR_CATEGORIES) {
    for (const filter of category.filters) {
      if (typeof filter.message === 'string') {
        if (errorMessage.includes(filter.message)) {
          return filter;
        }
      } else if (filter.message instanceof RegExp) {
        if (filter.message.test(errorMessage)) {
          return filter;
        }
      }
    }
  }

  return null;
}
