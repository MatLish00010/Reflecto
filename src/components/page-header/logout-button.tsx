'use client';

import { useTranslation } from '@/contexts/translation-context';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useSignOut } from '@/hooks/use-auth';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  const { t } = useTranslation();
  const signOutMutation = useSignOut();

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (error) {
      console.error('Sign out error:', error);
    }
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
