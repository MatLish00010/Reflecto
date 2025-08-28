import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
import { useMemo } from 'react';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { APP_CONSTANTS } from '@/shared/common/config';
import { getLocaleByLang } from '@/shared/common/lib/date-utils';

import type { DateFormatType, NumberFormatType } from '@/shared/common/types';

const DATE_FORMAT_CONFIG: Record<DateFormatType, string> =
  APP_CONSTANTS.DATE_FORMATS;

const NUMBER_FORMAT_CONFIG: Record<NumberFormatType, Intl.NumberFormatOptions> =
  {
    DEFAULT: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
    CURRENCY: {
      style: 'currency',
      currency: 'USD',
    },
    PERCENT: {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    },
    FILE_SIZE: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
  };

export function useFormatters() {
  const { lang } = useTranslation();

  const locale = useMemo(() => getLocaleByLang(lang), [lang]);

  const formatters = useMemo(
    () => ({
      formatDate: (
        date: Date | string,
        formatType: DateFormatType = 'SHORT'
      ) => {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        const formatStr = DATE_FORMAT_CONFIG[formatType];
        return format(dateObj, formatStr, { locale });
      },

      formatNumber: (
        value: number,
        formatType: NumberFormatType = 'DEFAULT',
        options?: { currency?: string }
      ) => {
        const targetLocale = lang === 'ru' ? 'ru-RU' : 'en-US';

        if (formatType === 'FILE_SIZE') {
          const units = ['B', 'KB', 'MB', 'GB'];
          let size = value;
          let unitIndex = 0;

          while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
          }

          return `${size.toFixed(1)} ${units[unitIndex]}`;
        }

        const config = NUMBER_FORMAT_CONFIG[formatType];
        const formatOptions = {
          ...config,
          currency:
            options?.currency || (config as { currency?: string }).currency,
        };

        if (formatType === 'PERCENT') {
          return new Intl.NumberFormat(targetLocale, formatOptions).format(
            value / 100
          );
        }

        return new Intl.NumberFormat(targetLocale, formatOptions).format(value);
      },

      locale,
      lang,
    }),
    [locale, lang]
  );

  return formatters;
}
