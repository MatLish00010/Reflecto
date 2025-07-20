'use client';

import { useTranslation } from '@/shared/contexts/translation-context';
import { DropdownMenuItem } from '@/shared/ui/dropdown-menu';
import { useSignOut } from '@/features/auth';
import { LogOut } from 'lucide-react';
import { safeSentry } from '@/shared/lib/sentry';

export function LogoutButton() {
  const { t } = useTranslation();
  const signOutMutation = useSignOut();

  const handleSignOut = async () => {
    return safeSentry.startSpanAsync(
      {
        op: 'ui.click',
        name: 'User Logout',
      },
      async span => {
        try {
          span.setAttribute('component', 'LogoutButton');
          span.setAttribute('action', 'signOut');

          await signOutMutation.mutateAsync();

          span.setAttribute('success', true);
        } catch (error) {
          safeSentry.captureException(error as Error, {
            tags: {
              component: 'LogoutButton',
              action: 'signOut',
            },
          });
          span.setAttribute('error', true);

          const { logger } = safeSentry;
          logger.error('Sign out error', {
            component: 'LogoutButton',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    );
  };

  return (
    <DropdownMenuItem
      onClick={handleSignOut}
      disabled={signOutMutation.isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {signOutMutation.isPending ? t('user.loggingOut') : t('user.logout')}
    </DropdownMenuItem>
  );
}
