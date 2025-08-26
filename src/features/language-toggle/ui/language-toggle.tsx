'use client';

import { useTranslation } from '@/shared/client/contexts/translation-context';
import { Globe } from '@/shared/client/icons';
import { Button } from '@/shared/client/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/client/ui/dropdown-menu';
import { languages } from '../config/languages';
import { useLanguageSwitch } from '../utils/language-utils';

export function LanguageToggle() {
  const { t } = useTranslation();
  const { switchLanguage, currentLanguage, currentLocale } =
    useLanguageSwitch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(language => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => switchLanguage(language.code)}
            className={currentLocale === language.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{language.flag}</span>
            {t(`languages.${language.name}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
