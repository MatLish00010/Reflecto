import type { NextRequest } from 'next/server';
import {
  handleApiRequest,
  RATE_LIMIT_CONFIGS,
  ServiceFactory,
  VALIDATION_SCHEMAS,
  withRateLimit,
  withValidation,
} from '@/shared/common/lib/api';
import type { ApiContext } from '@/shared/common/types';

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'get_daily_summaries' },
    withValidation(VALIDATION_SCHEMAS.dateRange, { validateQuery: true })(
      async (context: ApiContext, _request: NextRequest, validatedData) => {
        context.span.setAttribute('filters.from', validatedData.from || '');
        context.span.setAttribute('filters.to', validatedData.to || '');

        const dailySummaryService = ServiceFactory.createDailySummaryService(
          context.supabase
        );

        if (!validatedData.from || !validatedData.to) {
          return { error: 'Missing required date parameters' };
        }

        const summaries = await dailySummaryService.fetchSummaries(
          context.user.id,
          validatedData.from,
          validatedData.to,
          { span: context.span, operation: 'get_daily_summaries' }
        );

        context.span.setAttribute('summaries.count', summaries.length);
        return { summaries };
      }
    )
  );
}
