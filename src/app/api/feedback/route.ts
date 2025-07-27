import { NextRequest } from 'next/server';
import {
  handleApiRequest,
  withValidation,
  VALIDATION_SCHEMAS,
  ServiceFactory,
} from '@/shared/lib/api';

export async function GET(request: NextRequest) {
  return handleApiRequest(
    request,
    { operation: 'fetch_feedback' },
    async context => {
      const feedbackService = ServiceFactory.createFeedbackService(
        context.supabase
      );
      const feedback = await feedbackService.fetchFeedback({
        userId: context.user.id,
        options: { span: context.span, operation: 'fetch_feedback' },
      });

      return { feedback };
    }
  );
}

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    { operation: 'create_feedback' },
    withValidation(VALIDATION_SCHEMAS.createFeedback)(
      async (context, request: NextRequest, validatedData) => {
        context.span.setAttribute('feedback.type', validatedData.type);
        context.span.setAttribute(
          'feedback.title.length',
          validatedData.title.length
        );

        const feedbackService = ServiceFactory.createFeedbackService(
          context.supabase
        );
        const newFeedback = await feedbackService.createFeedback({
          userId: context.user.id,
          type: validatedData.type,
          title: validatedData.title,
          description: validatedData.description,
          options: { span: context.span, operation: 'create_feedback' },
        });

        return { feedback: newFeedback };
      }
    )
  );
}
