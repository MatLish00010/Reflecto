import type { NextRequest } from 'next/server';
import { safeSentry } from '@/shared/common/lib/sentry';
import {
  createErrorResponse,
  createSuccessResponse,
} from '../utils/response-helpers';
import { type ApiContext, type ApiHandlerOptions, withAuth } from './auth';

export async function handleApiRequest<T>(
  request: NextRequest,
  options: ApiHandlerOptions,
  handler: (
    context: ApiContext,
    request: NextRequest
  ) => Promise<T | Response | Record<string, unknown>>
): Promise<Response> {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: `${request.method} ${request.nextUrl.pathname}`,
    },
    async span => {
      try {
        const authResult = await withAuth(request, { ...options, span });
        if (authResult.error) {
          return authResult.error;
        }

        if (!authResult.context) {
          return createErrorResponse(
            new Error('Authentication context is missing'),
            500,
            options.operation
          );
        }

        const result = await handler(authResult.context, request);
        span.setAttribute('success', true);

        // If result is already a Response, return it as is
        if (result instanceof Response) {
          return result;
        }

        // If result is an object, wrap it in Response
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
