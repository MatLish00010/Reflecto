import type { NextResponse } from 'next/server';
import { API_CONFIG } from '@/shared/common/config';
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
        API_CONFIG.ERROR_MESSAGES.OPENAI_QUOTA_EXCEEDED,
        API_CONFIG.STATUS_CODES.TOO_MANY_REQUESTS,
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
      return createErrorResponse(
        API_CONFIG.ERROR_MESSAGES.OPENAI_INVALID_KEY,
        API_CONFIG.STATUS_CODES.UNAUTHORIZED,
        operation
      );
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

    return createErrorResponse(
      API_CONFIG.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      API_CONFIG.STATUS_CODES.INTERNAL_SERVER_ERROR,
      operation
    );
  }

  // Fallback for unknown errors
  safeSentry.captureException(new Error('Unknown error occurred'), {
    tags: { operation },
    extra: { originalError: error },
  });

  return createErrorResponse(
    API_CONFIG.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    API_CONFIG.STATUS_CODES.INTERNAL_SERVER_ERROR,
    operation
  );
}

// Common error creators
export const Errors = {
  BadRequest: (message: string, details?: Record<string, unknown>) =>
    createApiError(
      message,
      API_CONFIG.STATUS_CODES.BAD_REQUEST,
      'BAD_REQUEST',
      details
    ),

  Unauthorized: (
    message = API_CONFIG.ERROR_MESSAGES.UNAUTHORIZED,
    details?: Record<string, unknown>
  ) =>
    createApiError(
      message,
      API_CONFIG.STATUS_CODES.UNAUTHORIZED,
      'UNAUTHORIZED',
      details
    ),

  Forbidden: (
    message = API_CONFIG.ERROR_MESSAGES.FORBIDDEN,
    details?: Record<string, unknown>
  ) =>
    createApiError(
      message,
      API_CONFIG.STATUS_CODES.FORBIDDEN,
      'FORBIDDEN',
      details
    ),

  NotFound: (
    message = API_CONFIG.ERROR_MESSAGES.NOT_FOUND,
    details?: Record<string, unknown>
  ) =>
    createApiError(
      message,
      API_CONFIG.STATUS_CODES.NOT_FOUND,
      'NOT_FOUND',
      details
    ),

  Conflict: (message: string, details?: Record<string, unknown>) =>
    createApiError(
      message,
      API_CONFIG.STATUS_CODES.CONFLICT,
      'CONFLICT',
      details
    ),

  TooManyRequests: (
    message = API_CONFIG.ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    details?: Record<string, unknown>
  ) =>
    createApiError(
      message,
      API_CONFIG.STATUS_CODES.TOO_MANY_REQUESTS,
      'TOO_MANY_REQUESTS',
      details
    ),

  InternalServerError: (
    message = API_CONFIG.ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    details?: Record<string, unknown>
  ) =>
    createApiError(
      message,
      API_CONFIG.STATUS_CODES.INTERNAL_SERVER_ERROR,
      'INTERNAL_SERVER_ERROR',
      details
    ),

  ServiceUnavailable: (
    message = API_CONFIG.ERROR_MESSAGES.SERVICE_UNAVAILABLE,
    details?: Record<string, unknown>
  ) =>
    createApiError(
      message,
      API_CONFIG.STATUS_CODES.SERVICE_UNAVAILABLE,
      'SERVICE_UNAVAILABLE',
      details
    ),
};
