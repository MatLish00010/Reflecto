'use client';

import { useTranslation } from '@/shared/contexts/translation-context';
import type { User } from '@supabase/supabase-js';

interface UserInfoProps {
  user: User;
}

export function UserInfo({ user }: UserInfoProps) {
  const { t } = useTranslation();

  return (
    <div className="px-2 py-1.5 text-sm text-muted-foreground">
      <p>
        <strong>{t('auth.email')}:</strong> {user.email}
      </p>
      <p>
        <strong>{t('auth.name')}:</strong>{' '}
        {user.user_metadata?.name || t('user.notFound')}
      </p>
      <p>
        <strong>{t('user.createdAt')}:</strong>{' '}
        {new Date(user.created_at).toISOString().slice(0, 19).replace('T', ' ')}
      </p>
    </div>
  );
}
