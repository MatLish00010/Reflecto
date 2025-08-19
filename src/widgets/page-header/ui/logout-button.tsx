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
      className="h-10"
    >
      <LogOut className="mr-2 h-5 w-5" />
      {isPending ? t('user.loggingOut') : t('user.logout')}
    </DropdownMenuItem>
  );
}
