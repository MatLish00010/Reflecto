import type { NextRequest } from 'next/server';
import {
  AI_SUMMARY_ARRAY_FIELDS,
  AI_SUMMARY_REQUIRED_FIELDS,
  type ApiContext,
  formatNotesForPrompt,
  handleApiRequest,
  RATE_LIMIT_CONFIGS,
  ServiceFactory,
  VALIDATION_SCHEMAS,
  withRateLimit,
  withValidation,
} from '@/shared/common/lib/api';
import { getAISummaryPrompt } from '@/shared/common/lib/prompts';
import type { AISummaryData } from '@/shared/common/types';

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'get_daily_summary' },
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

        const summary = await dailySummaryService.fetchSingleSummary(
          context.user.id,
          validatedData.from,
          validatedData.to,
          { span: context.span, operation: 'get_daily_summary' }
        );

        return { summary };
      }
    )
  );
}

export async function POST(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.ai)(handleApiRequest)(
    request,
    { operation: 'create_daily_summary' },
    withValidation(VALIDATION_SCHEMAS.dailySummary)(
      async (context: ApiContext, _request: NextRequest, validatedData) => {
        context.span.setAttribute('locale', validatedData.locale);
        context.span.setAttribute('filters.from', validatedData.from);
        context.span.setAttribute('filters.to', validatedData.to);
        context.span.setAttribute('notes.count', validatedData.notes.length);

        const dailySummaryService = ServiceFactory.createDailySummaryService(
          context.supabase
        );
        const openAIService = ServiceFactory.createOpenAIService();

        const prompt = getAISummaryPrompt();

        const summary = await openAIService.callOpenAIAndParseJSON({
          messages: formatNotesForPrompt(validatedData.notes),
          prompt,
          options: {
            span: context.span,
            operation: 'create_daily_summary',
          },
        });

        const validatedSummary = openAIService.validateAISummaryStructure({
          summary,
          requiredFields: AI_SUMMARY_REQUIRED_FIELDS,
          arrayFields: AI_SUMMARY_ARRAY_FIELDS,
          options: {
            span: context.span,
            operation: 'create_daily_summary',
          },
        }) as unknown as AISummaryData;

        await dailySummaryService.saveSummary(
          validatedSummary,
          context.user.id,
          validatedData.from,
          { span: context.span, operation: 'create_daily_summary' }
        );

        return { summary: validatedSummary };
      }
    )
  );
}
