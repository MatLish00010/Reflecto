'use client';

import { useTranslation } from '@/contexts/translation-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { useSignOut } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut } from 'lucide-react';

export function PageHeader() {
  const { t } = useTranslation();

  return (
    <header className="text-center py-8 relative">
      <div className="absolute top-0 right-0 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
        <UserInfoDropdown />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        {t('app.title')}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">{t('app.description')}</p>
    </header>
  );
}

function UserInfoDropdown() {
  const { t } = useTranslation();
  const { user, isLoading, error } = useUser();
  const signOutMutation = useSignOut();

  const handleSignOut = async () => {
    try {
      await signOutMutation.mutateAsync();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-9 w-32" />;
  }

  if (error || !user) {
    return (
      <Button variant="outline" size="sm" disabled>
        {t('user.error')}
      </Button>
    );
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
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Name:</strong> {user.user_metadata?.name || 'Not set'}
          </p>
          <p>
            <strong>{t('user.createdAt')}:</strong>{' '}
            {new Date(user.created_at)
              .toISOString()
              .slice(0, 19)
              .replace('T', ' ')}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={signOutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {signOutMutation.isPending ? 'Signing out...' : t('user.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
