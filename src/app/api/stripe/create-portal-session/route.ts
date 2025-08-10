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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const YOUR_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const portalSessionSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required'),
});

export async function POST(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'create_portal_session' },
    withValidation(portalSessionSchema, { validateBody: true })(
      async (context: ApiContext, request: NextRequest, validatedData) => {
        context.span.setAttribute('stripe.operation', 'create_portal_session');
        context.span.setAttribute(
          'stripe.session_id',
          validatedData.session_id
        );

        const checkoutSession = await stripe.checkout.sessions.retrieve(
          validatedData.session_id
        );

        context.span.setAttribute(
          'stripe.customer_id',
          checkoutSession.customer as string
        );

        const returnUrl = `${YOUR_DOMAIN}/subscriptions`;

        const portalSession = await stripe.billingPortal.sessions.create({
          customer: checkoutSession.customer as string,
          return_url: returnUrl,
        });

        context.span.setAttribute('stripe.portal_session_id', portalSession.id);
        if (portalSession.url) {
          context.span.setAttribute(
            'stripe.portal_session_url',
            portalSession.url
          );
        }

        return { url: portalSession.url };
      }
    )
  );
}
