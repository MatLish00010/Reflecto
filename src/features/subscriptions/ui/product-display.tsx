import { Crown, Flame, Star, Zap } from 'lucide-react';
import type React from 'react';
import type { Stripe } from 'stripe';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { Badge } from '@/shared/client/ui/badge';
import { Button } from '@/shared/client/ui/button';
import { Card, CardContent } from '@/shared/client/ui/card';

interface ProductDisplayProps {
  products: Stripe.Price[];
  isLoading: boolean;
  onCheckout: (lookupKey: string) => void;
}

interface ProductCardProps {
  price: Stripe.Price;
  isPopular: boolean;
  savings: number | null;
  isLoading: boolean;
  onCheckout: (lookupKey: string) => void;
}

interface PlanIconProps {
  intervalCount?: number;
}

const getSavingsAmount = (
  currentPrice: Stripe.Price,
  allProducts: Stripe.Price[]
): number | null => {
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

  if (!monthlyPrice?.unit_amount || !currentPrice.unit_amount) {
    return null;
  }

  const savings =
    monthlyPrice.unit_amount * intervalCount - currentPrice.unit_amount;

  return savings > 0 ? savings : null;
};

const getPlanIcon = ({ intervalCount }: PlanIconProps) => {
  const iconConfigs = {
    1: { icon: Zap, gradient: 'from-blue-500 to-cyan-500' },
    3: { icon: Crown, gradient: 'from-purple-500 to-pink-500' },
    6: { icon: Star, gradient: 'from-orange-500 to-red-500' },
  };

  const config = iconConfigs[intervalCount as keyof typeof iconConfigs];
  if (!config) {
    return null;
  }

  const IconComponent = config.icon;

  return (
    <div
      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
    >
      <IconComponent className="w-6 h-6 text-white" />
    </div>
  );
};

const getPlanName = (
  t: (key: string) => string,
  intervalCount?: number
): string => {
  const planNames = {
    1: 'subscriptions.monthly',
    3: 'subscriptions.quarterly',
    6: 'subscriptions.semi_annual',
  };

  return t(
    planNames[intervalCount as keyof typeof planNames] ||
      'subscriptions.product'
  );
};

const formatPrice = (amount: number): string => {
  return `$${(amount / 100).toFixed(0)}`;
};

const formatInterval = (
  t: (key: string) => string,
  intervalCount?: number
): string => {
  return intervalCount === 1
    ? `1 ${t('subscriptions.month_short')}`
    : `${intervalCount} ${t('subscriptions.months_short')}`;
};

const PopularBadge: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="absolute -top-2 -right-2 z-10">
      <div className="bg-pink-100 text-gray-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
        <Flame className="w-3 h-3 text-orange-500" />
        {t('subscriptions.popular_choice')}
      </div>
    </div>
  );
};

const PriceInfo: React.FC<{ price: Stripe.Price; savings: number | null }> = ({
  price,
  savings,
}) => {
  const { t } = useTranslation();
  const intervalCount = price.recurring?.interval_count;

  return (
    <div className="text-right lg:text-center">
      <div className="text-2xl lg:text-3xl font-bold text-gray-900 lg:mb-1">
        {formatPrice(price.unit_amount || 0)}
        <span className="text-sm font-normal text-gray-600 lg:hidden">
          {' '}
          /{formatInterval(t, intervalCount)}
        </span>
      </div>
      <div className="text-sm text-gray-600 lg:mb-2 lg:block hidden">
        {formatInterval(t, intervalCount)}
      </div>
      {savings && (
        <div className="mt-1 lg:mt-0">
          <Badge className="bg-green-100 text-green-800 text-xs pointer-events-none">
            {t('subscriptions.save_20').replace('$%s', formatPrice(savings))}
          </Badge>
        </div>
      )}
    </div>
  );
};

const PlanButton: React.FC<{
  isLoading: boolean;
  onCheckout: () => void;
}> = ({ isLoading, onCheckout }) => {
  const { t } = useTranslation();

  return (
    <Button
      onClick={onCheckout}
      disabled={isLoading}
      variant="gradient"
      className="w-full"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          {t('subscriptions.processing')}
        </>
      ) : (
        t('subscriptions.choose_plan')
      )}
    </Button>
  );
};

const ProductCard: React.FC<ProductCardProps> = ({
  price,
  isPopular,
  savings,
  isLoading,
  onCheckout,
}) => {
  const { t } = useTranslation();
  const intervalCount = price.recurring?.interval_count;

  return (
    <div className="relative h-full">
      {isPopular && <PopularBadge />}

      <Card
        className={`relative overflow-hidden h-full flex flex-col ${
          isPopular
            ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200'
            : 'bg-white'
        }`}
      >
        <CardContent className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4 lg:flex-col lg:text-center lg:mb-6">
            <div className="flex items-center gap-3 lg:flex-col lg:gap-0 lg:mb-3">
              <div className="lg:mb-3">{getPlanIcon({ intervalCount })}</div>
              <div>
                <h3 className="font-bold text-gray-900 lg:text-lg">
                  {getPlanName(t, intervalCount)}
                </h3>
              </div>
            </div>

            <PriceInfo price={price} savings={savings} />
          </div>

          <div className="mt-auto">
            <PlanButton
              isLoading={isLoading}
              onCheckout={() => onCheckout(price.lookup_key || price.id)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ProductDisplay: React.FC<ProductDisplayProps> = ({
  products,
  isLoading,
  onCheckout,
}) => {
  const sortedProducts = products.sort((a, b) => {
    const aCount = a.recurring?.interval_count || 0;
    const bCount = b.recurring?.interval_count || 0;
    return aCount - bCount;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {sortedProducts.map(price => {
        const intervalCount = price.recurring?.interval_count;
        const isPopular = intervalCount === 3;
        const savings = getSavingsAmount(price, products);

        return (
          <ProductCard
            key={price.id}
            price={price}
            isPopular={isPopular}
            savings={savings}
            isLoading={isLoading}
            onCheckout={onCheckout}
          />
        );
      })}
    </div>
  );
};
