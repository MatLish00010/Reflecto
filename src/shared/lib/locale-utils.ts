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
import { supportedLocales, SupportedLocale } from './language-detector';

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

export function getDateFnsLocale(lang: string): Locale {
  return localeMap[lang] || enUS;
}

export function getTimeLocale(lang: string): string {
  return timeLocaleMap[lang] || 'en-US';
}

export function isLanguageSupported(lang: string): boolean {
  return supportedLocales.includes(lang as SupportedLocale);
}
