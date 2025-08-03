import type { Stripe } from 'stripe';

export const stripeService = {
  async getProducts(): Promise<Stripe.Price[]> {
    const response = await fetch('/api/stripe/products');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch products');
    }

    return data.prices || [];
  },

  async createCheckoutSession(lookupKey: string): Promise<{ url: string }> {
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lookup_key: lookupKey,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create checkout session');
    }

    return data;
  },

  async createPortalSession(sessionId: string): Promise<{ url: string }> {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create portal session');
    }

    return data;
  },
};
