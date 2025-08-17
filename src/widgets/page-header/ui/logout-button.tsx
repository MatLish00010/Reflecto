'use client';

import { useTranslation } from '@/shared/contexts/translation-context';
import { DropdownMenuItem } from '@/shared/ui/dropdown-menu';
import { useSignOutWithTracing } from '@/features/auth';
import { LogOut } from '@/shared/icons';

export function LogoutButton() {
  const { t } = useTranslation();
  const { handleSignOut, isPending } = useSignOutWithTracing();

  return (
    <DropdownMenuItem
      onClick={() => handleSignOut('LogoutButton')}
      disabled={isPending}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? t('user.loggingOut') : t('user.logout')}
    </DropdownMenuItem>
  );
}
