import { NextRequest } from 'next/server';
import {
  getSummaryLabels,
  getWeeklySummaryPrompt,
  getWeeklySummarySystemPrompt,
  type Locale,
} from '../../../../prompts';
import type { AISummaryData } from '@/shared/types';
import {
  handleApiRequest,
  callOpenAIAndParseJSON,
  validateAISummaryStructure,
  type ApiContext,
  withValidation,
  VALIDATION_SCHEMAS,
  formatDailySummariesForPrompt,
  AI_SUMMARY_REQUIRED_FIELDS,
  AI_SUMMARY_ARRAY_FIELDS,
  ServiceFactory,
} from '@/shared/lib/api';
import { toIsoDate } from '@/shared/lib/date-utils';

export async function GET(request: NextRequest) {
  return handleApiRequest(
    request,
    { operation: 'get_weekly_summary' },
    withValidation(VALIDATION_SCHEMAS.dateRange, { validateQuery: true })(
      async (context: ApiContext, request: NextRequest, validatedData) => {
        context.span.setAttribute(
          'filters.from',
          validatedData.from ? toIsoDate(validatedData.from) : ''
        );
        context.span.setAttribute(
          'filters.to',
          validatedData.to ? toIsoDate(validatedData.to) : ''
        );

        const weeklySummaryService = ServiceFactory.createWeeklySummaryService(
          context.supabase
        );
        const summary = await weeklySummaryService.fetchSingleSummary(
          context.user.id,
          validatedData.from!,
          validatedData.to!,
          { span: context.span, operation: 'get_weekly_summary' }
        );

        return { summary };
      }
    )
  );
}

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    { operation: 'create_weekly_summary' },
    withValidation(VALIDATION_SCHEMAS.weeklySummary)(
      async (context: ApiContext, request: NextRequest, validatedData) => {
        context.span.setAttribute('locale', validatedData.locale);
        context.span.setAttribute(
          'filters.from',
          toIsoDate(validatedData.from)
        );
        context.span.setAttribute('filters.to', toIsoDate(validatedData.to));

        const dailySummaryService = ServiceFactory.createDailySummaryService(
          context.supabase
        );
        const weeklySummaryService = ServiceFactory.createWeeklySummaryService(
          context.supabase
        );

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

        // Format daily summaries for the prompt
        const labels = getSummaryLabels(validatedData.locale);
        const dailySummariesTexts = formatDailySummariesForPrompt(
          dailySummaries,
          labels
        );

        const prompt = getWeeklySummaryPrompt(
          validatedData.locale as Locale,
          dailySummariesTexts
        );
        const systemPrompt = getWeeklySummarySystemPrompt(
          validatedData.locale as Locale
        );

        const summary = await callOpenAIAndParseJSON(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          {
            span: context.span,
            operation: 'create_weekly_summary',
            maxTokens: 8000,
          }
        );

        const validatedSummary = validateAISummaryStructure(
          summary,
          AI_SUMMARY_REQUIRED_FIELDS,
          AI_SUMMARY_ARRAY_FIELDS
        ) as unknown as AISummaryData;

        await weeklySummaryService.saveSummary(
          validatedSummary,
          context.user.id,
          toIsoDate(validatedData.from),
          { span: context.span, operation: 'create_weekly_summary' }
        );

        return { summary: validatedSummary };
      }
    )
  );
}
