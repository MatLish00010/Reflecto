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
import { User, LogIn } from 'lucide-react';
import { UserInfo } from './user-info';
import { LogoutButton } from './logout-button';

export function UserInfoDropdown() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, error } = useUser();
  const { openModal } = useAuthModalContext();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 min-w-0 max-w-[200px]"
        >
          <User className="h-4 w-4 flex-shrink-0" />
          <span className="truncate text-left hidden sm:inline">
            {displayName}
          </span>
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
  );
}
