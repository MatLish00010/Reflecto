import type { Span } from '@sentry/types';
import Stripe from 'stripe';
import { safeSentry } from '@/shared/lib/sentry';

export interface StripeServiceOptions {
  span?: Span;
  operation?: string;
}

export interface StripeProductsResult {
  products: Stripe.Product[];
  prices: Stripe.Price[];
}

export interface StripeCheckoutSessionResult {
  url: string | null;
}

export interface StripePortalSessionResult {
  url: string | null;
}

export class StripeService {
  private stripe: Stripe | null = null;

  private getStripe(): Stripe {
    if (!this.stripe) {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        throw new Error('STRIPE_SECRET_KEY environment variable is not set');
      }
      this.stripe = new Stripe(stripeSecretKey);
    }
    return this.stripe;
  }

  async getProducts(
    options: StripeServiceOptions = {}
  ): Promise<StripeProductsResult> {
    const { span, operation = 'get_stripe_products' } = options;
    const stripe = this.getStripe();

    try {
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

      span?.setAttribute('products.count', products.data.length);
      span?.setAttribute('prices.count', activePrices.length);

      return {
        products: products.data,
        prices: activePrices,
      };
    } catch (error) {
      safeSentry.captureException(error as Error, {
        tags: { operation },
      });
      throw error;
    }
  }

  async createCheckoutSession(
    lookupKey: string,
    userId: string,
    domain: string,
    options: StripeServiceOptions = {}
  ): Promise<StripeCheckoutSessionResult> {
    const { span, operation = 'create_checkout_session' } = options;
    const stripe = this.getStripe();

    try {
      span?.setAttribute('stripe.lookup_key', lookupKey);

      const prices = await stripe.prices.list({
        lookup_keys: [lookupKey],
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
        success_url: `${domain}/subscriptions?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${domain}/subscriptions?canceled=true`,
        metadata: {
          user_id: userId,
        },
      });

      span?.setAttribute('stripe.session_id', session.id);
      if (session.url) {
        span?.setAttribute('stripe.session_url', session.url);
      }

      return { url: session.url };
    } catch (error) {
      safeSentry.captureException(error as Error, {
        tags: { operation },
        extra: { lookupKey, userId },
      });
      throw error;
    }
  }

  async createPortalSession(
    sessionId: string,
    domain: string,
    options: StripeServiceOptions = {}
  ): Promise<StripePortalSessionResult> {
    const { span, operation = 'create_portal_session' } = options;
    const stripe = this.getStripe();

    try {
      span?.setAttribute('stripe.session_id', sessionId);

      const checkoutSession =
        await stripe.checkout.sessions.retrieve(sessionId);

      span?.setAttribute(
        'stripe.customer_id',
        checkoutSession.customer as string
      );

      const returnUrl = `${domain}/subscriptions`;

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: checkoutSession.customer as string,
        return_url: returnUrl,
      });

      span?.setAttribute('stripe.portal_session_id', portalSession.id);
      if (portalSession.url) {
        span?.setAttribute('stripe.portal_session_url', portalSession.url);
      }

      return { url: portalSession.url };
    } catch (error) {
      safeSentry.captureException(error as Error, {
        tags: { operation },
        extra: { sessionId },
      });
      throw error;
    }
  }

  async constructWebhookEvent(
    body: string,
    signature: string,
    webhookSecret: string,
    options: StripeServiceOptions = {}
  ): Promise<Stripe.Event> {
    const { operation = 'construct_webhook_event' } = options;
    const stripe = this.getStripe();

    try {
      return stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      safeSentry.captureException(error as Error, {
        tags: { operation },
      });
      throw error;
    }
  }

  async retrieveSubscription(
    subscriptionId: string,
    options: StripeServiceOptions = {}
  ): Promise<Stripe.Subscription> {
    const { operation = 'retrieve_subscription' } = options;
    const stripe = this.getStripe();

    try {
      return stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      safeSentry.captureException(error as Error, {
        tags: { operation },
        extra: { subscriptionId },
      });
      throw error;
    }
  }
}
