import { NextRequest } from 'next/server';
import {
  getAISummaryPrompt,
  getAISummarySystemPrompt,
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
  AI_SUMMARY_REQUIRED_FIELDS,
  AI_SUMMARY_ARRAY_FIELDS,
  ServiceFactory,
} from '@/shared/lib/api';

export async function GET(request: NextRequest) {
  return handleApiRequest(
    request,
    { operation: 'get_ai_summary' },
    withValidation(VALIDATION_SCHEMAS.dateRange, { validateQuery: true })(
      async (context: ApiContext, request: NextRequest, validatedData) => {
        const { searchParams } = new URL(request.url);
        const returnAll = searchParams.get('returnAll') === 'true';

        context.span.setAttribute('filters.from', validatedData.from || '');
        context.span.setAttribute('filters.to', validatedData.to || '');
        context.span.setAttribute('filters.returnAll', returnAll);

        const dailySummaryService = ServiceFactory.createDailySummaryService(
          context.supabase
        );

        if (returnAll) {
          const summaries = await dailySummaryService.fetchSummaries(
            context.user.id,
            validatedData.from!,
            validatedData.to!,
            { span: context.span, operation: 'get_ai_summary' }
          );

          context.span.setAttribute('summaries.count', summaries.length);
          return { summaries };
        } else {
          const summary = await dailySummaryService.fetchSingleSummary(
            context.user.id,
            validatedData.from!,
            validatedData.to!,
            { span: context.span, operation: 'get_ai_summary' }
          );

          return { summary };
        }
      }
    )
  );
}

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    { operation: 'create_ai_summary' },
    withValidation(VALIDATION_SCHEMAS.dailySummary)(
      async (context: ApiContext, request: NextRequest, validatedData) => {
        context.span.setAttribute('locale', validatedData.locale);
        context.span.setAttribute('filters.date', validatedData.date);
        context.span.setAttribute('notes.count', validatedData.notes.length);

        const dailySummaryService = ServiceFactory.createDailySummaryService(
          context.supabase
        );

        const prompt = getAISummaryPrompt(
          validatedData.locale as Locale,
          validatedData.notes
        );
        const systemPrompt = getAISummarySystemPrompt(
          validatedData.locale as Locale
        );

        const summary = await callOpenAIAndParseJSON(
          [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          {
            span: context.span,
            operation: 'create_ai_summary',
            maxTokens: 4000,
          }
        );

        const validatedSummary = validateAISummaryStructure(
          summary,
          AI_SUMMARY_REQUIRED_FIELDS,
          AI_SUMMARY_ARRAY_FIELDS
        ) as unknown as AISummaryData;

        await dailySummaryService.saveSummary(
          validatedSummary,
          context.user.id,
          validatedData.date,
          { span: context.span, operation: 'create_ai_summary' }
        );

        return { summary: validatedSummary };
      }
    )
  );
}
