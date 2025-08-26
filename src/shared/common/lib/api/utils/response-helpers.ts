import { NextResponse } from 'next/server';
import { safeSentry } from '@/shared/common/lib/sentry';

export function createErrorResponse(
  error: Error | string,
  status: number = 500,
  operation?: string,
  extra?: Record<string, unknown>
): NextResponse {
  const errorMessage = typeof error === 'string' ? error : error.message;

  if (operation) {
    safeSentry.captureException(
      error instanceof Error ? error : new Error(errorMessage),
      {
        tags: { operation },
        extra,
      }
    );
  }

  return NextResponse.json({ error: errorMessage }, { status });
}

export function createSuccessResponse<T>(data: T): NextResponse {
  return NextResponse.json(data);
}
