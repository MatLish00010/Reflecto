'use client';

import { createContext, type ReactNode, useContext } from 'react';
import { safeSentry } from '@/shared/lib/sentry';

interface TranslationContextType {
  t: (key: string) => string;
  dict: Record<string, unknown>;
  lang: string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined
);

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}

interface TranslationProviderProps {
  children: ReactNode;
  dict: Record<string, unknown>;
  lang: string;
}

export function TranslationProvider({
  children,
  dict,
  lang,
}: TranslationProviderProps) {
  const t = (key: string) => {
    const keys = key.split('.');
    let value: unknown = dict;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        const { logger } = safeSentry;
        logger.warn('Translation key not found', {
          component: 'TranslationProvider',
          key,
          lang,
          availableKeys: Object.keys(dict),
        });
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <TranslationContext.Provider value={{ t, dict, lang }}>
      {children}
    </TranslationContext.Provider>
  );
}
