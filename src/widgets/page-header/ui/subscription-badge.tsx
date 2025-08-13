'use client';

import { useTranslation } from '@/shared/contexts/translation-context';
import { Badge } from '@/shared/ui/badge';
import { Crown } from 'lucide-react';

interface SubscriptionBadgeProps {
  isSubscribed: boolean;
  className?: string;
}

export function SubscriptionBadge({
  isSubscribed,
  className,
}: SubscriptionBadgeProps) {
  const { t } = useTranslation();

  if (!isSubscribed) {
    return null;
  }

  return (
    <Badge variant="subscription" className={className}>
      <Crown className="w-3 h-3 mr-1 text-purple-100" />
      {t('subscriptions.pro')}
    </Badge>
  );
}
