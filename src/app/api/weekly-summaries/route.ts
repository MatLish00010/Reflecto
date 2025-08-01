import { NextRequest } from 'next/server';
import {
  handleApiRequest,
  type ApiContext,
  withValidation,
  VALIDATION_SCHEMAS,
  ServiceFactory,
  withRateLimit,
  RATE_LIMIT_CONFIGS,
} from '@/shared/lib/api';

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'get_weekly_summaries' },
    withValidation(VALIDATION_SCHEMAS.dateRange, { validateQuery: true })(
      async (context: ApiContext, request: NextRequest, validatedData) => {
        context.span.setAttribute('filters.from', validatedData.from || '');
        context.span.setAttribute('filters.to', validatedData.to || '');

        const weeklySummaryService = ServiceFactory.createWeeklySummaryService(
          context.supabase
        );

        const summaries = await weeklySummaryService.fetchSummaries(
          context.user.id,
          validatedData.from!,
          validatedData.to!,
          { span: context.span, operation: 'get_weekly_summaries' }
        );

        context.span.setAttribute('summaries.count', summaries.length);
        return { summaries };
      }
    )
  );
}
