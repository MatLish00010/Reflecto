'use client';

import { useUser } from '@/entities/user';
import { useAuthModalContext } from '@/shared/client/contexts/auth-modal-context';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { LogIn, User } from '@/shared/client/icons';
import { Button } from '@/shared/client/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/client/ui/dropdown-menu';
import { Skeleton } from '@/shared/client/ui/skeleton';
import { LogoutButton } from './logout-button';
import { SubscriptionIcon } from './subscription-icon';
import { UserInfo } from './user-info';

interface UserButtonProps {
  className?: string;
  maxNameLength?: number;
}

export function UserButton({ className, maxNameLength = 20 }: UserButtonProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, error, subscription } = useUser();
  const { openModal } = useAuthModalContext();

  if (isLoading) {
    return <Skeleton className={`h-9 w-24 ${className || ''}`} />;
  }

  if (!isAuthenticated) {
    return (
      <Button
        onClick={openModal}
        variant="outline"
        size="sm"
        className={className}
      >
        <LogIn className="w-4 h-4 mr-2" />
        {t('auth.signIn')}
      </Button>
    );
  }

  if (error || !user) {
    return null;
  }

  const displayName = user.user_metadata?.name || user.email;
  const shortName =
    displayName.length > maxNameLength
      ? `${displayName.substring(0, maxNameLength)}...`
      : displayName;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 min-w-0 max-w-[200px] ${
            className || ''
          }`}
        >
          <SubscriptionIcon
            isSubscribed={!!subscription?.isActive}
            className="flex-shrink-0"
          />
          <User className="h-4 w-4 flex-shrink-0" />
          <span className="truncate text-left">{shortName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        <DropdownMenuLabel>{t('user.info')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <UserInfo user={user} isSubscribed={!!subscription?.isActive} />
        <DropdownMenuSeparator />
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
