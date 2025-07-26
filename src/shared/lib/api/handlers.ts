import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/shared/lib/server';
import { requireAuth } from '@/shared/lib/auth';
import { safeSentry } from '@/shared/lib/sentry';
import type { Span } from '@sentry/types';

export interface ApiHandlerOptions {
  requireAuthentication?: boolean;
  operation: string;
  span?: Span;
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export interface ApiContext {
  user: AuthenticatedUser;
  supabase: Awaited<ReturnType<typeof createServerClient>>;
  span: Span;
}

export async function withAuth(
  request: NextRequest,
  options: ApiHandlerOptions
): Promise<{ context?: ApiContext; error?: NextResponse }> {
  const { requireAuthentication = true, span } = options;

  if (!requireAuthentication) {
    const supabase = await createServerClient();
    return { context: { user: { id: 'anonymous' }, supabase, span: span! } };
  }

  const authResult = await requireAuth();
  if (!authResult.isAuthenticated) {
    span?.setAttribute('auth.status', 'unauthenticated');
    return { error: authResult.response };
  }

  const supabase = await createServerClient();
  const context: ApiContext = {
    user: authResult.user!,
    supabase,
    span: span!,
  };

  span?.setAttribute('user.id', context.user.id);
  return { context };
}

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

export async function handleApiRequest<T>(
  request: NextRequest,
  options: ApiHandlerOptions,
  handler: (
    context: ApiContext,
    request: NextRequest
  ) => Promise<T | NextResponse | Record<string, unknown>>
): Promise<NextResponse> {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: `${request.method} ${request.nextUrl.pathname}`,
    },
    async span => {
      try {
        const authResult = await withAuth(request, { ...options, span });
        if (authResult.error) return authResult.error;

        const result = await handler(authResult.context!, request);
        span.setAttribute('success', true);

        // Если результат уже является NextResponse, возвращаем его как есть
        if (result instanceof NextResponse) {
          return result;
        }

        // Если результат - объект, оборачиваем в Response
        return createSuccessResponse(result);
      } catch (error) {
        const errorResponse = createErrorResponse(
          error as Error,
          500,
          options.operation
        );
        span.setAttribute('error', true);
        return errorResponse;
      }
    }
  );
}

export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => !body[field]);
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

export function validateDateRange(
  from?: string,
  to?: string
): { isValid: boolean; error?: string } {
  if (!from || !to) {
    return { isValid: false, error: 'from and to parameters are required' };
  }
  return { isValid: true };
}
