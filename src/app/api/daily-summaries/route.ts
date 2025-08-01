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
    { operation: 'get_daily_summaries' },
    withValidation(VALIDATION_SCHEMAS.dateRange, { validateQuery: true })(
      async (context: ApiContext, request: NextRequest, validatedData) => {
        context.span.setAttribute('filters.from', validatedData.from || '');
        context.span.setAttribute('filters.to', validatedData.to || '');

        const dailySummaryService = ServiceFactory.createDailySummaryService(
          context.supabase
        );

        const summaries = await dailySummaryService.fetchSummaries(
          context.user.id,
          validatedData.from!,
          validatedData.to!,
          { span: context.span, operation: 'get_daily_summaries' }
        );

        context.span.setAttribute('summaries.count', summaries.length);
        return { summaries };
      }
    )
  );
}
