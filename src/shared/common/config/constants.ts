export const APP_CONSTANTS = {
  // Crypto
  CRYPTO: {
    ALGORITHM: 'aes-256-gcm',
    IV_LENGTH: 12,
    KEY_LENGTH: 32,
  },

  // Date Formats (используются в use-formatters.ts)
  DATE_FORMATS: {
    SHORT: 'dd.MM.yyyy',
    LONG: 'dd MMMM yyyy',
    FULL: 'EEEE, dd MMMM yyyy',
    DATETIME: 'dd.MM.yyyy HH:mm',
    WEEK: 'dd.MM',
    TIME: 'HH:mm',
    MONTH: 'MMMM yyyy',
    YEAR: 'yyyy',
    DAY: 'd',
    MONTH_SHORT: 'MMM',
    API: 'yyyy-MM-dd',
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  } as const,

  // Localization
  SUPPORTED_LOCALES: ['en', 'ru'] as const,
  DEFAULT_LOCALE: 'ru' as const,
} as const;

export type AppConstants = typeof APP_CONSTANTS;
