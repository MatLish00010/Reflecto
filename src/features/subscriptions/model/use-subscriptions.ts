'use client';

import { useState, useEffect } from 'react';
import type { Stripe } from 'stripe';

export const useSubscriptions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Stripe.Price[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/stripe/products');
      const data = await response.json();

      if (data.prices) {
        const sortedProducts = data.prices.sort(
          (a: Stripe.Price, b: Stripe.Price) => {
            const amountA = a.unit_amount || 0;
            const amountB = b.unit_amount || 0;
            return amountA - amountB;
          }
        );
        setProducts(sortedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleCheckout = async (lookupKey: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lookup_key: lookupKey,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loadingProducts,
    isLoading,
    handleCheckout,
    handleManageBilling,
  };
};
