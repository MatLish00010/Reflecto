import { NextRequest } from 'next/server';
import {
  handleApiRequest,
  type ApiContext,
  withValidation,
  withRateLimit,
  RATE_LIMIT_CONFIGS,
} from '@/shared/lib/api';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!);

const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Payment succeeds
// 4242 4242 4242 4242

// Payment requires authentication
// 4000 0025 0000 3155

// Payment is declined
// 4000 0000 0000 9995
const checkoutSessionSchema = z.object({
  lookup_key: z.string().min(1, 'Lookup key is required'),
});

export async function POST(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'create_checkout_session' },
    withValidation(checkoutSessionSchema, { validateBody: true })(
      async (context: ApiContext, request: NextRequest, validatedData) => {
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
