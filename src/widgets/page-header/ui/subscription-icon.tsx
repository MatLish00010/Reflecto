'use client';

import { useTranslation } from '@/shared/client/contexts/translation-context';
import { Crown } from '@/shared/client/icons';

interface SubscriptionIconProps {
  isSubscribed: boolean;
  className?: string;
  showText?: boolean;
}

export function SubscriptionIcon({
  isSubscribed,
  className,
  showText = false,
}: SubscriptionIconProps) {
  const { t } = useTranslation();

  if (!isSubscribed) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <Crown className="w-3 h-3 text-purple-500" />
      {showText && (
        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
          {t('subscriptions.pro')}
        </span>
      )}
    </div>
  );
}
