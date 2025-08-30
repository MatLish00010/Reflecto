'use client';

import { Crown } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useUser } from '@/entities';
import { AuthRequiredMessage } from '@/shared/client/components/auth-required-message';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { useSubscriptions } from '../model/use-subscriptions';
import { ManageSubscription } from './manage-subscription';
import { MessageDisplay } from './message-display';
import { MessageDisplaySkeleton } from './message-display-skeleton';
import { ProductDisplay } from './product-display';
import { ProductDisplaySkeleton } from './product-display-skeleton';

export const SubscriptionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const { subscription, isAuthenticated } = useUser();

  const {
    products,
    loadingProducts,
    isLoading,
    handleCheckout,
    handleManageBilling,
  } = useSubscriptions();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get('canceled')) {
      setSuccess(false);
      setMessage(t('subscriptions.order_canceled'));
    }
  }, [t]);

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <AuthRequiredMessage messageKey="auth.signInToViewSubscriptions" />
      );
    }

    if (subscription?.isActive && subscription.stripeCustomerId) {
      return (
        <ManageSubscription
          stripeCustomerId={subscription.stripeCustomerId}
          isLoading={isLoading}
          onManageBilling={handleManageBilling}
        />
      );
    }

    if (loadingProducts) {
      return <ProductDisplaySkeleton />;
    }

    if (!success && message === '') {
      return (
        <>
          <ProductDisplay
            products={products}
            isLoading={isLoading}
            onCheckout={handleCheckout}
          />

          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              {t('subscriptions.cancel_anytime')}
            </p>
          </div>
        </>
      );
    }

    if (isLoading) {
      return <MessageDisplaySkeleton />;
    }

    return <MessageDisplay message={message} />;
  };

  return (
    <div className=" bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t('subscriptions.title')}
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            {t('subscriptions.description')}
          </p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};
