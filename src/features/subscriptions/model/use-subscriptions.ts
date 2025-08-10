import { useQuery, useMutation } from '@tanstack/react-query';
import type { Stripe } from 'stripe';
import { stripeService } from '@/shared/lib/api/services/client';
import { safeSentry } from '@/shared/lib/sentry';

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  products: () => [...subscriptionKeys.all, 'products'] as const,
};

export const useSubscriptionProducts = () => {
  return useQuery({
    queryKey: subscriptionKeys.products(),
    queryFn: async (): Promise<Stripe.Price[]> => {
      const products = await stripeService.getProducts();
      return products.sort((a, b) => {
        const amountA = a.unit_amount || 0;
        const amountB = b.unit_amount || 0;
        return amountA - amountB;
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCheckout = () => {
  return useMutation({
    mutationFn: async (lookupKey: string) => {
      const { url } = await stripeService.createCheckoutSession(lookupKey);
      if (url) {
        window.location.href = url;
      }
    },
    onError: error => {
      safeSentry.captureException(error, {
        tags: { operation: 'create_checkout_session' },
      });
    },
  });
};

export const useManageBilling = () => {
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { url } = await stripeService.createPortalSession(sessionId);
      if (url) {
        window.location.href = url;
      }
    },
    onError: error => {
      safeSentry.captureException(error, {
        tags: { operation: 'create_portal_session' },
      });
    },
  });
};

export const useSubscriptions = () => {
  const {
    data: products = [],
    isLoading: loadingProducts,
    error: productsError,
  } = useSubscriptionProducts();

  const checkoutMutation = useCheckout();
  const manageBillingMutation = useManageBilling();

  const handleCheckout = (lookupKey: string) => {
    checkoutMutation.mutate(lookupKey);
  };

  const handleManageBilling = (sessionId: string) => {
    manageBillingMutation.mutate(sessionId);
  };

  return {
    products,
    loadingProducts,
    isLoading: checkoutMutation.isPending || manageBillingMutation.isPending,
    handleCheckout,
    handleManageBilling,
    error: productsError,
  };
};
