import type { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import {
  type ApiContext,
  handleApiRequest,
  RATE_LIMIT_CONFIGS,
  withRateLimit,
  withValidation,
} from '@/shared/lib/api';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}
const stripe = new Stripe(stripeSecretKey);

const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

        const prices = await stripe.prices.list({
          lookup_keys: [validatedData.lookup_key],
          expand: ['data.product'],
        });

        if (!prices.data.length) {
          throw new Error('Price not found');
        }

        const session = await stripe.checkout.sessions.create({
          billing_address_collection: 'auto',
          line_items: [
            {
              price: prices.data[0].id,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${YOUR_DOMAIN}/subscriptions?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${YOUR_DOMAIN}/subscriptions?canceled=true`,
          metadata: {
            user_id: context.user.id,
          },
        });

        context.span.setAttribute('stripe.session_id', session.id);
        if (session.url) {
          context.span.setAttribute('stripe.session_url', session.url);
        }

        return { url: session.url };
      }
    )
  );
}
