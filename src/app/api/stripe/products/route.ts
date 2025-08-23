import type { NextRequest } from 'next/server';
import {
  type ApiContext,
  handleApiRequest,
  RATE_LIMIT_CONFIGS,
  withRateLimit,
} from '@/shared/lib/api';
import { ServiceFactory } from '@/shared/lib/api/utils/service-factory';

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'get_stripe_products' },
    async (context: ApiContext) => {
      context.span.setAttribute('stripe.operation', 'list_products');

      const stripeService = ServiceFactory.createStripeService();
      const result = await stripeService.getProducts({
        span: context.span,
        operation: 'get_stripe_products',
      });

      return result;
    }
  );
}
