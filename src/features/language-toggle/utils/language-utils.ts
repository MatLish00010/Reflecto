import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from '@/shared/client/contexts/locale-context';
import { languages } from '../config/languages';

export function useLanguageSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentLocale } = useLocale();

  const switchLanguage = (langCode: string) => {
    const pathWithoutLang = pathname?.replace(/^\/[a-z]{2}/, '') || '/';
    const newPath = `/${langCode}${pathWithoutLang}`;
    router.push(newPath);
  };

  const currentLanguage =
    languages.find(lang => lang.code === currentLocale) || languages[0];

  return {
    switchLanguage,
    currentLanguage,
    currentLocale,
  };
}
