import type { NextRequest } from 'next/server';
import {
  type ApiContext,
  handleApiRequest,
  RATE_LIMIT_CONFIGS,
  ServiceFactory,
  VALIDATION_SCHEMAS,
  withRateLimit,
  withValidation,
} from '@/shared/lib/api';

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'get_weekly_summaries' },
    withValidation(VALIDATION_SCHEMAS.dateRange, { validateQuery: true })(
      async (context: ApiContext, _request: NextRequest, validatedData) => {
        context.span.setAttribute('filters.from', validatedData.from || '');
        context.span.setAttribute('filters.to', validatedData.to || '');

        const weeklySummaryService = ServiceFactory.createWeeklySummaryService(
          context.supabase
        );

        if (!validatedData.from || !validatedData.to) {
          return { error: 'Missing required date parameters' };
        }

        const summaries = await weeklySummaryService.fetchSummaries(
          context.user.id,
          validatedData.from,
          validatedData.to,
          { span: context.span, operation: 'get_weekly_summaries' }
        );

        context.span.setAttribute('summaries.count', summaries.length);
        return { summaries };
      }
    )
  );
}
