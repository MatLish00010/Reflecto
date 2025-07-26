import { NextResponse } from 'next/server';
import { safeSentry } from '@/shared/lib/sentry';

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

    return NextResponse.json(
      {
        error: error.message,
        ...(error.code && { code: error.code }),
        ...(error.details && { details: error.details }),
      },
      { status: error.status }
    );
  }

  // Handle OpenAI specific errors
  if (error instanceof Error) {
    const errorMessage = error.message;

    if (errorMessage.includes('quota exceeded')) {
      return NextResponse.json(
        {
          error:
            'OpenAI quota exceeded. Please try again later or upgrade your plan.',
        },
        { status: 429 }
      );
    }

    if (errorMessage.includes('Unsupported audio file format')) {
      return NextResponse.json(
        { error: 'Unsupported audio file format' },
        { status: 400 }
      );
    }

    if (errorMessage.includes('File too large')) {
      return NextResponse.json(
        { error: 'File too large (maximum 25MB)' },
        { status: 413 }
      );
    }

    if (errorMessage.includes('Invalid OpenAI API key')) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key' },
        { status: 401 }
      );
    }

    if (errorMessage.includes('rate limit exceeded')) {
      return NextResponse.json(
        { error: 'OpenAI rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Generic error handling
    safeSentry.captureException(error, {
      tags: { operation },
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  // Fallback for unknown errors
  safeSentry.captureException(new Error('Unknown error occurred'), {
    tags: { operation },
    extra: { originalError: error },
  });

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
