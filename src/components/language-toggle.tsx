'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/contexts/translation-context';

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

  const currentLang = pathname.split('/')[1] || 'ru';

  const switchLanguage = (langCode: string) => {
    const pathWithoutLang = pathname.replace(/^\/[a-z]{2}/, '') || '/';
    router.push(`/${langCode}${pathWithoutLang}`);
  };

  const currentLanguage =
    languages.find(lang => lang.code === currentLang) || languages[0];

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
            className={currentLang === language.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{language.flag}</span>
            {t(`languages.${language.name}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
