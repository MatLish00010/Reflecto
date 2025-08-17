'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useSubscriptions } from '../model/use-subscriptions';
import { ProductDisplay } from './product-display';
import { SuccessDisplay } from './success-display';
import { MessageDisplay } from './message-display';
import { ProductDisplaySkeleton } from './product-display-skeleton';
import { SuccessDisplaySkeleton } from './success-display-skeleton';
import { MessageDisplaySkeleton } from './message-display-skeleton';

export const SubscriptionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [sessionId, setSessionId] = useState('');

  const {
    products,
    loadingProducts,
    isLoading,
    handleCheckout,
    handleManageBilling,
  } = useSubscriptions();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get('success')) {
      setSuccess(true);
      setSessionId(query.get('session_id') || '');
    }

    if (query.get('canceled')) {
      setSuccess(false);
      setMessage(t('subscriptions.order_canceled'));
    }
  }, [sessionId, t]);

  if (loadingProducts) {
    return <ProductDisplaySkeleton />;
  }

  if (!success && message === '') {
    return (
      <ProductDisplay
        products={products}
        isLoading={isLoading}
        onCheckout={handleCheckout}
      />
    );
  }

  if (success && sessionId !== '') {
    if (isLoading) {
      return <SuccessDisplaySkeleton />;
    }
    return (
      <SuccessDisplay
        sessionId={sessionId}
        isLoading={isLoading}
        onManageBilling={handleManageBilling}
      />
    );
  }

  if (isLoading) {
    return <MessageDisplaySkeleton />;
  }

  return <MessageDisplay message={message} />;
};
