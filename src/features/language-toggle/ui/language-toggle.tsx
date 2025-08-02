'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useLocale } from '@/shared/contexts/locale-context';

const languages = [
  { code: 'ru', flag: '🇷🇺', name: 'russian' },
  { code: 'en', flag: '🇺🇸', name: 'english' },
  // { code: 'de', flag: '🇩🇪', name: 'german' },
  // { code: 'fr', flag: '🇫🇷', name: 'french' },
  // { code: 'es', flag: '🇪🇸', name: 'spanish' },
  // { code: 'it', flag: '🇮🇹', name: 'italian' },
  // { code: 'pt', flag: '🇵🇹', name: 'portuguese' },
  // { code: 'ja', flag: '🇯🇵', name: 'japanese' },
  // { code: 'ko', flag: '🇰🇷', name: 'korean' },
  // { code: 'zh', flag: '🇨🇳', name: 'chinese' },
];

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const { currentLocale } = useLocale();

  const switchLanguage = (langCode: string) => {
    const pathWithoutLang = pathname?.replace(/^\/[a-z]{2}/, '') || '/';
    const newPath = `/${langCode}${pathWithoutLang}`;
    router.push(newPath);
  };

  const currentLanguage =
    languages.find(lang => lang.code === currentLocale) || languages[0];

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
