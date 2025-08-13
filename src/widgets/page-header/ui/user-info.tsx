'use client';

import { useTranslation } from '@/shared/contexts/translation-context';
import type { User } from '@supabase/supabase-js';
import { Crown } from 'lucide-react';

interface UserInfoProps {
  user: User;
  isSubscribed?: boolean;
}

export function UserInfo({ user, isSubscribed }: UserInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="px-2 py-1.5 text-sm text-muted-foreground">
      {/* Subscription status - first and prominent */}
      {isSubscribed && (
        <div className="mb-3 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 dark:from-purple-400/20 dark:to-blue-400/20 rounded-lg border border-purple-300/30 dark:border-purple-600/30">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-purple-500/20 dark:bg-purple-400/20 rounded-full">
              <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              {t('subscriptions.pro')} {t('subscriptions.subscription')}
            </span>
          </div>
          <p className="text-xs text-purple-600/80 dark:text-purple-400/80 ml-6">
            {t('subscriptions.active')} • {t('subscriptions.premium')}
          </p>
        </div>
      )}

      {/* User information */}
      <div className="space-y-2">
        <p className="break-all">
          <strong>{t('auth.email')}:</strong>
          <span className="truncate block">{user.email}</span>
        </p>
        <p className="break-all">
          <strong>{t('auth.name')}:</strong>{' '}
          <span className="truncate block">
            {user.user_metadata?.name || t('user.notFound')}
          </span>
        </p>
        <p>
          <strong>{t('user.createdAt')}:</strong>{' '}
          {new Date(user.created_at)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')}
        </p>
      </div>
    </div>
  );
}
