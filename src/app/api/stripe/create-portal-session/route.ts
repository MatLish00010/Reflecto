import type { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  type ApiContext,
  handleApiRequest,
  RATE_LIMIT_CONFIGS,
  withRateLimit,
  withValidation,
} from '@/shared/common/lib/api';
import { ServiceFactory } from '@/shared/common/lib/api/utils/service-factory';

const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const portalSessionSchema = z.object({
  customer: z.string().min(1, 'Customer ID is required'),
});

export async function POST(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'create_portal_session' },
    withValidation(portalSessionSchema, { validateBody: true })(
      async (context: ApiContext, _request: NextRequest, validatedData) => {
        context.span.setAttribute('stripe.operation', 'create_portal_session');
        context.span.setAttribute('stripe.customer_id', validatedData.customer);

        const stripeService = ServiceFactory.createStripeService();
        const result = await stripeService.createPortalSession(
          validatedData.customer,
          YOUR_DOMAIN,
          {
            span: context.span,
            operation: 'create_portal_session',
          }
        );

        return result as unknown as Record<string, unknown>;
      }
    )
  );
}
