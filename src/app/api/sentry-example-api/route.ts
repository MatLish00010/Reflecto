import { NextRequest } from 'next/server';
import {
  handleApiRequest,
  withRateLimit,
  RATE_LIMIT_CONFIGS,
} from '@/shared/lib/api';

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = 'SentryExampleAPIError';
  }
}

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'sentry_example_error' },
    async context => {
      context.span.setAttribute('error.intentional', true);
      throw new SentryExampleAPIError(
        'This error is raised on the backend called by the example page.'
      );
    }
  );
}
