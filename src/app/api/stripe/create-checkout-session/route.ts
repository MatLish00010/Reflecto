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

const checkoutSessionSchema = z.object({
  lookup_key: z.string().min(1, 'Lookup key is required'),
});

export async function POST(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'create_checkout_session' },
    withValidation(checkoutSessionSchema, { validateBody: true })(
      async (context: ApiContext, _request: NextRequest, validatedData) => {
        context.span.setAttribute(
          'stripe.operation',
          'create_checkout_session'
        );
        context.span.setAttribute(
          'stripe.lookup_key',
          validatedData.lookup_key
        );

        const stripeService = ServiceFactory.createStripeService();
        const result = await stripeService.createCheckoutSession(
          validatedData.lookup_key,
          context.user.id,
          YOUR_DOMAIN,
          {
            span: context.span,
            operation: 'create_checkout_session',
          }
        );

        return result as unknown as Record<string, unknown>;
      }
    )
  );
}
