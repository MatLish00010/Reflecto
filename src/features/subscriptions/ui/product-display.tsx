import React from 'react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import type { Stripe } from 'stripe';

interface ProductDisplayProps {
  products: Stripe.Price[];
  isLoading: boolean;
  onCheckout: (lookupKey: string) => void;
}

const getSavingsBadge = (
  currentPrice: Stripe.Price,
  allProducts: Stripe.Price[]
) => {
  const interval = currentPrice.recurring?.interval;
  const intervalCount = currentPrice.recurring?.interval_count;

  if (interval !== 'month' || !intervalCount || intervalCount <= 1) {
    return null;
  }

  const monthlyPrice = allProducts.find(
    price =>
      price.recurring?.interval === 'month' &&
      price.recurring?.interval_count === 1
  );

  if (!monthlyPrice || !monthlyPrice.unit_amount || !currentPrice.unit_amount) {
    return null;
  }

  const currentMonthlyCost = currentPrice.unit_amount / intervalCount;

  const savingsPercent = Math.round(
    ((monthlyPrice.unit_amount - currentMonthlyCost) /
      monthlyPrice.unit_amount) *
      100
  );

  if (savingsPercent > 0) {
    return <Badge variant="premium">-{savingsPercent}%</Badge>;
  }

  return null;
};

export const ProductDisplay: React.FC<ProductDisplayProps> = ({
  products,
  isLoading,
  onCheckout,
}) => {
  const { t } = useTranslation();

  const getSubscriptionPeriod = (interval?: string, intervalCount?: number) => {
    if (!interval) return t('subscriptions.month');

    if (interval === 'month') {
      if (intervalCount === 1) return t('subscriptions.month');
      if (intervalCount === 3) return t('subscriptions.three_month');
      if (intervalCount === 6) return t('subscriptions.six_month');
    }

    // Fallback for other intervals
    return `${intervalCount || 1} ${interval}`;
  };

  return (
    <div className="flex items-center justify-center">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(price => {
            const product = price.product as Stripe.Product;
            return (
              <Card key={price.id} className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white text-center">
                    {product?.name || t('subscriptions.product')}
                  </CardTitle>
                  <div className="text-center">
                    <div className="relative">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        ${(price.unit_amount! / 100).toFixed(2)}
                      </div>
                      {getSavingsBadge(price, products)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {getSubscriptionPeriod(
                        price.recurring?.interval,
                        price.recurring?.interval_count
                      )}
                    </div>
                  </div>
                  {product?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {product.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <Button
                    onClick={() => onCheckout(price.lookup_key || price.id)}
                    disabled={isLoading}
                    variant="gradient"
                    size="lg"
                    className="w-full mt-auto"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        {t('subscriptions.processing')}
                      </>
                    ) : (
                      t('subscriptions.checkout')
                    )}
                  </Button>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('subscriptions.features')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
