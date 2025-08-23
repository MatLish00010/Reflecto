import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

export const SUPPORTED_LOCALES = [
  'en',
  'ru',
  'de',
  'fr',
  'es',
  'it',
  'pt',
  'ja',
  'ko',
  'zh',
] as const;

export const supportedLocales = SUPPORTED_LOCALES;
export const DEFAULT_LOCALE = 'ru';

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export function detectUserLanguage(request: Request): SupportedLocale {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  const detectedLocale = match(languages, supportedLocales, DEFAULT_LOCALE);

  return supportedLocales.includes(detectedLocale as SupportedLocale)
    ? (detectedLocale as SupportedLocale)
    : DEFAULT_LOCALE;
}

export function isLocaleSupported(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}
