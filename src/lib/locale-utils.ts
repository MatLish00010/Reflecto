import {
  ru,
  enUS,
  de,
  fr,
  es,
  it,
  pt,
  ja,
  ko,
  zhCN,
  Locale,
} from 'date-fns/locale';

// Маппинг языковых кодов на локали date-fns
const localeMap: Record<string, Locale> = {
  ru,
  en: enUS,
  de,
  fr,
  es,
  it,
  pt,
  ja,
  ko,
  zh: zhCN,
};

// Маппинг языковых кодов на локали для toLocaleTimeString
const timeLocaleMap: Record<string, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
};

/**
 * Получает локаль date-fns для указанного языка
 * @param lang - языковой код
 * @returns локаль date-fns или enUS по умолчанию
 */
export function getDateFnsLocale(lang: string): Locale {
  return localeMap[lang] || enUS;
}

/**
 * Получает локаль для toLocaleTimeString
 * @param lang - языковой код
 * @returns строка локали или 'en-US' по умолчанию
 */
export function getTimeLocale(lang: string): string {
  return timeLocaleMap[lang] || 'en-US';
}

/**
 * Проверяет, поддерживается ли язык
 * @param lang - языковой код
 * @returns true если язык поддерживается
 */
export function isLanguageSupported(lang: string): boolean {
  return lang in localeMap;
}
