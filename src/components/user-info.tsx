'use client';

import { useUser } from '@/hooks/use-user';
import { useTranslation } from '@/contexts/translation-context';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/use-auth';
import type { Tables } from '@/types/supabase';
import { useRouter } from 'next/navigation';

interface UserInfoProps {
  initialUser?: Tables<'users'> | null;
}

export function UserInfo({ initialUser }: UserInfoProps) {
  const { user, loading, error } = useUser(initialUser);
  const { t } = useTranslation();
  const logoutMutation = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-green-800 dark:text-green-200">
          {t('user.info')}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="text-green-700 dark:text-green-300 border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-800"
        >
          {logoutMutation.isPending ? 'Logging out...' : t('user.logout')}
        </Button>
      </div>
      <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
        <p>
          <strong>{t('user.id')}:</strong> {user.id}
        </p>
        <p>
          <strong>{t('user.createdAt')}:</strong>{' '}
          {new Date(user.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
