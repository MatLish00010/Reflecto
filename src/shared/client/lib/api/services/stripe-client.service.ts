import type { Stripe } from 'stripe';
import { API_CONFIG } from '@/shared/common/config';

export const stripeService = {
  async getProducts(): Promise<Stripe.Price[]> {
    const response = await fetch(API_CONFIG.ENDPOINTS.STRIPE.PRODUCTS);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch products');
    }

    return data.prices || [];
  },

  async createCheckoutSession(lookupKey: string): Promise<{ url: string }> {
    const response = await fetch(API_CONFIG.ENDPOINTS.STRIPE.CHECKOUT, {
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

  async createPortalSession(customerId: string): Promise<{ url: string }> {
    const response = await fetch(API_CONFIG.ENDPOINTS.STRIPE.PORTAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: customerId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create portal session');
    }

    return data;
  },
};
