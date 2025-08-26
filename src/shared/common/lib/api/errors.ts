import type { NextResponse } from 'next/server';
import { safeSentry } from '@/shared/common/lib/sentry';
import { createErrorResponse } from './utils/response-helpers';

export interface ApiErrorInterface {
  message: string;
  status: number;
  code?: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error implements ApiErrorInterface {
  public status: number;
  public code?: string;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function createApiError(
  message: string,
  status: number,
  code?: string,
  details?: Record<string, unknown>
): ApiError {
  return new ApiError(message, status, code, details);
}

export function handleApiError(
  error: unknown,
  operation: string
): NextResponse {
  if (error instanceof ApiError) {
    safeSentry.captureException(error, {
      tags: { operation },
      extra: { status: error.status, code: error.code, details: error.details },
    });

    return createErrorResponse(error.message, error.status, operation, {
      code: error.code,
      details: error.details,
    });
  }

  // Handle OpenAI specific errors
  if (error instanceof Error) {
    const errorMessage = error.message;

    if (errorMessage.includes('quota exceeded')) {
      return createErrorResponse(
        'OpenAI quota exceeded. Please try again later or upgrade your plan.',
        429,
        operation
      );
    }

    if (errorMessage.includes('Unsupported audio file format')) {
      return createErrorResponse(
        'Unsupported audio file format',
        400,
        operation
      );
    }

    if (errorMessage.includes('File too large')) {
      return createErrorResponse(
        'File too large (maximum 25MB)',
        413,
        operation
      );
    }

    if (errorMessage.includes('Invalid OpenAI API key')) {
      return createErrorResponse('Invalid OpenAI API key', 401, operation);
    }

    if (errorMessage.includes('rate limit exceeded')) {
      return createErrorResponse(
        'OpenAI rate limit exceeded. Please try again later.',
        429,
        operation
      );
    }

    // Generic error handling
    safeSentry.captureException(error, {
      tags: { operation },
    });

    return createErrorResponse('Internal server error', 500, operation);
  }

  // Fallback for unknown errors
  safeSentry.captureException(new Error('Unknown error occurred'), {
    tags: { operation },
    extra: { originalError: error },
  });

  return createErrorResponse('Internal server error', 500, operation);
}

// Common error creators
export const Errors = {
  BadRequest: (message: string, details?: Record<string, unknown>) =>
    createApiError(message, 400, 'BAD_REQUEST', details),

  Unauthorized: (message = 'Unauthorized', details?: Record<string, unknown>) =>
    createApiError(message, 401, 'UNAUTHORIZED', details),

  Forbidden: (message = 'Forbidden', details?: Record<string, unknown>) =>
    createApiError(message, 403, 'FORBIDDEN', details),

  NotFound: (message = 'Not found', details?: Record<string, unknown>) =>
    createApiError(message, 404, 'NOT_FOUND', details),

  Conflict: (message: string, details?: Record<string, unknown>) =>
    createApiError(message, 409, 'CONFLICT', details),

  TooManyRequests: (
    message = 'Too many requests',
    details?: Record<string, unknown>
  ) => createApiError(message, 429, 'TOO_MANY_REQUESTS', details),

  InternalServerError: (
    message = 'Internal server error',
    details?: Record<string, unknown>
  ) => createApiError(message, 500, 'INTERNAL_SERVER_ERROR', details),

  ServiceUnavailable: (
    message = 'Service unavailable',
    details?: Record<string, unknown>
  ) => createApiError(message, 503, 'SERVICE_UNAVAILABLE', details),
};
