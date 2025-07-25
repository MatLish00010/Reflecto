import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

export const supportedLocales = [
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
export const defaultLocale = 'en';

export type SupportedLocale = (typeof supportedLocales)[number];

export function detectUserLanguage(request: Request): SupportedLocale {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  const detectedLocale = match(languages, supportedLocales, defaultLocale);

  return supportedLocales.includes(detectedLocale as SupportedLocale)
    ? (detectedLocale as SupportedLocale)
    : defaultLocale;
}

export function isLocaleSupported(locale: string): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}
