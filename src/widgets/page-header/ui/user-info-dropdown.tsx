'use client';

import { useTranslation } from '@/shared/contexts/translation-context';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useUser } from '@/entities/user';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { User, LogIn, LogOut } from 'lucide-react';
import { UserInfo } from './user-info';
import { LogoutButton } from './logout-button';
import { useSignOutWithTracing } from '@/features/auth';

export function UserInfoDropdown() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, error } = useUser();
  const { openModal } = useAuthModalContext();
  const { handleSignOut, isPending } = useSignOutWithTracing();

  if (isLoading) {
    return <Skeleton className="h-9 w-32" />;
  }

  if (!isAuthenticated) {
    return (
      <Button onClick={openModal} variant="outline" size="sm">
        <LogIn className="w-4 h-4 mr-2" />
        {t('auth.signIn')}
      </Button>
    );
  }

  if (error || !user) {
    return null;
  }

  const displayName = user.user_metadata?.name || user.email;

  return (
    <>
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 min-w-0 max-w-[200px]"
            >
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-left">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>{t('user.info')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <UserInfo user={user} />
            <DropdownMenuSeparator />
            <LogoutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="md:hidden">
        <div className="flex flex-col gap-3 p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="font-medium text-sm">{t('user.info')}</span>
          </div>
          <UserInfo user={user} />
          <Button
            onClick={() => handleSignOut('UserInfoDropdown')}
            disabled={isPending}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isPending ? t('user.loggingOut') : t('user.logout')}
          </Button>
        </div>
      </div>
    </>
  );
}
