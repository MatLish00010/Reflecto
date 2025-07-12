'use client';

import { useUserContext } from '@/contexts/user-context';
import { useTranslation } from '@/contexts/translation-context';

export function UserInfo() {
  const { user, loading, error } = useUserContext();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-blue-600 dark:text-blue-400">{t('user.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-600 dark:text-red-400">
          {t('user.error')}: {error}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-yellow-600 dark:text-yellow-400">
          {t('user.notFound')}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
        {t('user.info')}
      </h3>
      <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
        <p>
          <strong>{t('user.id')}:</strong> {user.id}
        </p>
        <p>
          <strong>{t('user.fingerprint')}:</strong> {user.fingerprint}
        </p>
        <p>
          <strong>{t('user.createdAt')}:</strong>{' '}
          {new Date(user.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
