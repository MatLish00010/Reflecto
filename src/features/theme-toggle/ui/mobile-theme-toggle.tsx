'use client';

import { useTranslation } from '@/shared/client/contexts/translation-context';
import { Moon, Sun } from '@/shared/client/icons';

import { Button } from '@/shared/client/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/client/ui/dropdown-menu';
import { useThemeUtils } from '../utils/theme-utils';

export function MobileThemeToggle() {
  const { setTheme, getThemeIcon } = useThemeUtils();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {getThemeIcon()}
          <span className="ml-3">{t('theme.theme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="h-4 w-4 mr-2" />
          {t('theme.light')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          {t('theme.dark')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <span className="h-4 w-4 mr-2">💻</span>
          {t('theme.system')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
