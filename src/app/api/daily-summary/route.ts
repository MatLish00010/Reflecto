import { NextRequest } from 'next/server';
import { getAISummaryPrompt, type Locale } from '../../../../prompts';
import type { AISummaryData } from '@/shared/types';
import {
  handleApiRequest,
  type ApiContext,
  withValidation,
  VALIDATION_SCHEMAS,
  AI_SUMMARY_REQUIRED_FIELDS,
  AI_SUMMARY_ARRAY_FIELDS,
  ServiceFactory,
  withRateLimit,
  RATE_LIMIT_CONFIGS,
  formatNotesForPrompt,
} from '@/shared/lib/api';

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'get_daily_summary' },
    withValidation(VALIDATION_SCHEMAS.dateRange, { validateQuery: true })(
      async (context: ApiContext, request: NextRequest, validatedData) => {
        context.span.setAttribute('filters.from', validatedData.from || '');
        context.span.setAttribute('filters.to', validatedData.to || '');

        const dailySummaryService = ServiceFactory.createDailySummaryService(
          context.supabase
        );

        const summary = await dailySummaryService.fetchSingleSummary(
          context.user.id,
          validatedData.from!,
          validatedData.to!,
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
      async (context: ApiContext, request: NextRequest, validatedData) => {
        context.span.setAttribute('locale', validatedData.locale);
        context.span.setAttribute('filters.from', validatedData.from);
        context.span.setAttribute('filters.to', validatedData.to);
        context.span.setAttribute('notes.count', validatedData.notes.length);

        const dailySummaryService = ServiceFactory.createDailySummaryService(
          context.supabase
        );
        const openAIService = ServiceFactory.createOpenAIService();

        const prompt = getAISummaryPrompt(validatedData.locale as Locale);

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
