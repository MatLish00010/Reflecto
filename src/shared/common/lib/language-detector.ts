import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { APP_CONSTANTS } from '@/shared/common/config';

import type { SupportedLocale } from '@/shared/common/types';

export function detectUserLanguage(request: Request): SupportedLocale {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  const detectedLocale = match(
    languages,
    APP_CONSTANTS.SUPPORTED_LOCALES,
    APP_CONSTANTS.DEFAULT_LOCALE
  );

  return APP_CONSTANTS.SUPPORTED_LOCALES.includes(
    detectedLocale as SupportedLocale
  )
    ? (detectedLocale as SupportedLocale)
    : APP_CONSTANTS.DEFAULT_LOCALE;
}

export function isLocaleSupported(locale: string): locale is SupportedLocale {
  return APP_CONSTANTS.SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
