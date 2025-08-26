import { useMutation, useQuery } from '@tanstack/react-query';
import type { Stripe } from 'stripe';
import { stripeService } from '@/shared/client/lib/api/services/client';
import { createGlobalEntityKeys } from '@/shared/client/lib/query-keys';
import { safeSentry } from '@/shared/common/lib/sentry';

export const subscriptionKeys = {
  ...createGlobalEntityKeys('subscriptions'),
  products: () => [...subscriptionKeys.all(), 'products'] as const,
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
    mutationFn: async (stripeCustomerId: string) => {
      const { url } = await stripeService.createPortalSession(stripeCustomerId);
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

  const handleManageBilling = (stripeCustomerId: string) => {
    manageBillingMutation.mutate(stripeCustomerId);
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
