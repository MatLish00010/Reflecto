import 'server-only';
import { APP_CONSTANTS } from '@/shared/common/config';

const dictionaries = {
  en: () => import('./en.json').then(module => module.default),
  ru: () => import('./ru.json').then(module => module.default),
  de: () => import('./en.json').then(module => module.default), // Fallback to English
  fr: () => import('./en.json').then(module => module.default), // Fallback to English
  es: () => import('./en.json').then(module => module.default), // Fallback to English
  it: () => import('./en.json').then(module => module.default), // Fallback to English
  pt: () => import('./en.json').then(module => module.default), // Fallback to English
  ja: () => import('./en.json').then(module => module.default), // Fallback to English
  ko: () => import('./en.json').then(module => module.default), // Fallback to English
  zh: () => import('./en.json').then(module => module.default), // Fallback to English
};

export const getDictionary = async (locale: string) => {
  if (
    APP_CONSTANTS.SUPPORTED_LOCALES.includes(
      locale as (typeof APP_CONSTANTS.SUPPORTED_LOCALES)[number]
    )
  ) {
    const dictionary = dictionaries[locale as keyof typeof dictionaries];
    if (dictionary) {
      return dictionary();
    }
  }
  // Fallback to English if locale is not supported
  return dictionaries.en();
};
