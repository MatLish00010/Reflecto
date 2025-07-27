import { NextRequest } from 'next/server';
import { safeSentry } from '@/shared/lib/sentry';
import { withAuth, type ApiContext, type ApiHandlerOptions } from './auth';
import {
  createErrorResponse,
  createSuccessResponse,
} from '../utils/response-helpers';

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
        if (authResult.error) return authResult.error;

        const result = await handler(authResult.context!, request);
        span.setAttribute('success', true);

        // Если результат уже является Response, возвращаем его как есть
        if (result instanceof Response) {
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
