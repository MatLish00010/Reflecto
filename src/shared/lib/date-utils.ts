import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
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

// Получает локаль для указанного языка
export function getLocaleByLang(lang: string): Locale {
  return localeMap[lang] || enUS;
}

// Returns a UTC ISO string for API
export function toApiDate(date: Date): string {
  return date.toISOString();
}

// Parses an ISO string to a Date object
export function fromApiDate(dateString: string): Date {
  return parseISO(dateString);
}

// Formats a date for display in the user's local time zone, using date-fns and locale
export function formatDateForDisplay(
  date: Date,
  lang: string,
  formatStr = 'Pp'
): string {
  // 'Pp' = localized date and time
  return format(date, formatStr, { locale: getLocaleByLang(lang) });
}

// Returns the UTC ISO string for the start of the day
export function getStartOfDayUTC(date: Date): string {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  );
  return utc.toISOString();
}

// Returns the UTC ISO string for the end of the day
export function getEndOfDayUTC(date: Date): string {
  const utc = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999
    )
  );
  return utc.toISOString();
}

// Returns a UTC ISO range for a given day
export function getDateRangeForDay(date: Date): { from: string; to: string } {
  return {
    from: getStartOfDayUTC(date),
    to: getEndOfDayUTC(date),
  };
}

// Returns the current date/time in UTC ISO format
export function getCurrentDateUTC(): string {
  return new Date().toISOString();
}

export function getStartOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
}

export function getEndOfWeek(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
}

export function getWeekRange(date: Date): { from: string; to: string } {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = getEndOfWeek(date);

  return {
    from: getStartOfDayUTC(startOfWeek),
    to: getEndOfDayUTC(endOfWeek),
  };
}
