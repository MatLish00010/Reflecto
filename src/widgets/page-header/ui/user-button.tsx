'use client';

import { useTranslation } from '@/shared/contexts/translation-context';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { useUser } from '@/entities/user';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';
import { User, LogIn } from '@/shared/icons';
import { SubscriptionIcon } from './subscription-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { UserInfo } from './user-info';
import { LogoutButton } from './logout-button';

interface UserButtonProps {
  className?: string;
  maxNameLength?: number;
}

export function UserButton({ className, maxNameLength = 20 }: UserButtonProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, error, isSubscribed } = useUser();
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
      ? displayName.substring(0, maxNameLength) + '...'
      : displayName;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 min-w-0 max-w-[200px] ${className || ''}`}
        >
          <SubscriptionIcon
            isSubscribed={isSubscribed}
            className="flex-shrink-0"
          />
          <User className="h-4 w-4 flex-shrink-0" />
          <span className="truncate text-left">{shortName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        <DropdownMenuLabel>{t('user.info')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <UserInfo user={user} isSubscribed={isSubscribed} />
        <DropdownMenuSeparator />
        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
