import type { NextRequest } from 'next/server';
import {
  AI_SUMMARY_ARRAY_FIELDS,
  AI_SUMMARY_REQUIRED_FIELDS,
  type ApiContext,
  formatDailySummariesForPrompt,
  handleApiRequest,
  RATE_LIMIT_CONFIGS,
  ServiceFactory,
  VALIDATION_SCHEMAS,
  withRateLimit,
  withValidation,
} from '@/shared/lib/api';
import type { AISummaryData } from '@/shared/types';
import {
  getSummaryLabels,
  getWeeklySummaryPrompt,
  type Locale,
} from '../../../../prompts';

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'get_weekly_summary' },
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

        const summary = await weeklySummaryService.fetchSingleSummary(
          context.user.id,
          validatedData.from,
          validatedData.to,
          { span: context.span, operation: 'get_weekly_summary' }
        );

        return { summary };
      }
    )
  );
}

export async function POST(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.ai)(handleApiRequest)(
    request,
    { operation: 'create_weekly_summary' },
    withValidation(VALIDATION_SCHEMAS.weeklySummary)(
      async (context: ApiContext, _request: NextRequest, validatedData) => {
        context.span.setAttribute('locale', validatedData.locale);
        context.span.setAttribute('filters.from', validatedData.from);
        context.span.setAttribute('filters.to', validatedData.to);

        const dailySummaryService = ServiceFactory.createDailySummaryService(
          context.supabase
        );
        const weeklySummaryService = ServiceFactory.createWeeklySummaryService(
          context.supabase
        );
        const openAIService = ServiceFactory.createOpenAIService();

        // Fetch daily summaries for the week
        const dailySummaries = await dailySummaryService.fetchSummaries(
          context.user.id,
          validatedData.from,
          validatedData.to,
          { span: context.span, operation: 'create_weekly_summary' }
        );

        if (dailySummaries.length === 0) {
          throw new Error('No daily summaries found for the specified period');
        }

        context.span.setAttribute('summaries.count', dailySummaries.length);

        const labels = getSummaryLabels(validatedData.locale);
        const dailySummariesTexts = formatDailySummariesForPrompt(
          dailySummaries,
          labels
        );

        const prompt = getWeeklySummaryPrompt(validatedData.locale as Locale);

        const summary = await openAIService.callOpenAIAndParseJSON({
          messages: dailySummariesTexts.join('\n\n'),
          prompt,
          options: {
            span: context.span,
            operation: 'create_weekly_summary',
          },
        });

        const validatedSummary = openAIService.validateAISummaryStructure({
          summary,
          requiredFields: AI_SUMMARY_REQUIRED_FIELDS,
          arrayFields: AI_SUMMARY_ARRAY_FIELDS,
          options: {
            span: context.span,
            operation: 'create_weekly_summary',
          },
        }) as unknown as AISummaryData;

        await weeklySummaryService.saveSummary(
          validatedSummary,
          context.user.id,
          validatedData.from,
          { span: context.span, operation: 'create_weekly_summary' }
        );

        return { summary: validatedSummary };
      }
    )
  );
}
