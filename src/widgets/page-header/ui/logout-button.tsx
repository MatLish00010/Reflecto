'use client';

import { useSignOutWithTracing } from '@/features/auth';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { LogOut } from '@/shared/client/icons';
import { DropdownMenuItem } from '@/shared/client/ui/dropdown-menu';

export function LogoutButton() {
  const { t } = useTranslation();
  const { handleSignOut, isPending } = useSignOutWithTracing();

  return (
    <DropdownMenuItem
      onClick={() => handleSignOut('LogoutButton')}
      disabled={isPending}
      className="h-10"
    >
      <LogOut className="mr-2 h-5 w-5" />
      {isPending ? t('user.loggingOut') : t('user.logout')}
    </DropdownMenuItem>
  );
}
