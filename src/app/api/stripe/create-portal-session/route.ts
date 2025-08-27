import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { ENV } from '@/shared/common/config';
import {
  handleApiRequest,
  RATE_LIMIT_CONFIGS,
  withRateLimit,
  withValidation,
} from '@/shared/common/lib/api';
import { ServiceFactory } from '@/shared/common/lib/api/utils/service-factory';
import type { ApiContext } from '@/shared/common/types';

const YOUR_DOMAIN = ENV.APP_URL;

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
