'use client';

import { useTranslation } from '@/shared/contexts/translation-context';
import { Globe } from '@/shared/icons';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { languages } from '../config/languages';
import { useLanguageSwitch } from '../utils/language-utils';

export function MobileLanguageToggle() {
  const { t } = useTranslation();
  const { switchLanguage, currentLanguage, currentLocale } =
    useLanguageSwitch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Globe className="h-4 w-4 mr-3" />
          <span>{t('languages.language')}</span>
          <span className="ml-auto">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-full">
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
