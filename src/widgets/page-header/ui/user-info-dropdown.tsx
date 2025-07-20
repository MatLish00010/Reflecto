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
  const { user, isAuthenticated, isPending, error } = useUser();
  const { openModal } = useAuthModalContext();

  if (isPending) {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          {user.user_metadata?.name || user.email}
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
