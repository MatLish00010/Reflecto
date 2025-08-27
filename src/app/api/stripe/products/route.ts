import type { NextRequest } from 'next/server';
import {
  handleApiRequest,
  RATE_LIMIT_CONFIGS,
  withRateLimit,
} from '@/shared/common/lib/api';
import { ServiceFactory } from '@/shared/common/lib/api/utils/service-factory';
import type { ApiContext } from '@/shared/common/types';

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
