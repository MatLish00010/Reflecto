'use client';

import { useUser } from '@/entities/user';
import { useTranslation } from '@/shared/contexts/translation-context';
import { Button } from '@/shared/ui/button';
import { useSignOut } from '@/features/auth';

export function UserInfo() {
  const { user, isPending, error } = useUser();
  const { t } = useTranslation();
  const signOutMutation = useSignOut();

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isPending) {
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
          {t('user.error')}: {error.message}
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
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-green-800 dark:text-green-200">
          {t('user.info')}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={signOutMutation.isPending}
          className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-800"
        >
          {signOutMutation.isPending ? t('user.loggingOut') : t('user.logout')}
        </Button>
      </div>
      <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Name:</strong> {user.user_metadata?.name || 'Not set'}
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
