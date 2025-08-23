import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import {
  type ApiContext,
  handleApiRequest,
  RATE_LIMIT_CONFIGS,
  withRateLimit,
} from '@/shared/lib/api';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}
const stripe = new Stripe(stripeSecretKey);

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'get_stripe_products' },
    async (context: ApiContext) => {
      context.span.setAttribute('stripe.operation', 'list_products');

      const products = await stripe.products.list({
        active: true,
        expand: ['data.default_price'],
      });

      const prices = await stripe.prices.list({
        active: true,
        expand: ['data.product'],
      });

      const activePrices = prices.data.filter(price => {
        const product = price.product as Stripe.Product;
        return product && product.active === true;
      });

      context.span.setAttribute('products.count', products.data.length);
      context.span.setAttribute('prices.count', activePrices.length);

      return {
        products: products.data,
        prices: activePrices,
      };
    }
  );
}
