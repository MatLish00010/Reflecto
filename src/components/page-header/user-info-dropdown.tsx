'use client';

import { useTranslation } from '@/contexts/translation-context';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from 'lucide-react';
import { UserInfo } from './user-info';
import { LogoutButton } from './logout-button';

export function UserInfoDropdown() {
  const { t } = useTranslation();
  const { user, isPending, error } = useUser();

  if (isPending) {
    return <Skeleton className="h-9 w-32" />;
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
