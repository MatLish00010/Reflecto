import { NextRequest } from 'next/server';
import {
  handleApiRequest,
  type ApiContext,
  withRateLimit,
  RATE_LIMIT_CONFIGS,
} from '@/shared/lib/api';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
