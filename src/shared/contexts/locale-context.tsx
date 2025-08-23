'use client';

import { usePathname } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { SUPPORTED_LOCALES } from '@/shared/lib/language-detector';

interface LocaleContextType {
  currentLocale: string;
  setCurrentLocale: (locale: string) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: string;
}

export function LocaleProvider({
  children,
  initialLocale,
}: LocaleProviderProps) {
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState(initialLocale || 'ru');

  useEffect(() => {
    // Extract locale from pathname
    const localeFromPath = pathname?.split('/')[1];
    if (
      localeFromPath &&
      SUPPORTED_LOCALES.includes(
        localeFromPath as (typeof SUPPORTED_LOCALES)[number]
      )
    ) {
      setCurrentLocale(localeFromPath);
    }
  }, [pathname]);

  return (
    <LocaleContext.Provider value={{ currentLocale, setCurrentLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
