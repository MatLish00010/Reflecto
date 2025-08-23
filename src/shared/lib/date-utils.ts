import {
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
} from 'date-fns';
import {
  de,
  enUS,
  es,
  fr,
  it,
  ja,
  ko,
  type Locale,
  pt,
  ru,
  zhCN,
} from 'date-fns/locale';
import React from 'react'; // Added for useDateFromUrl hook

// Language code mapping to date-fns locales
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

// Gets locale for the specified language
export function getLocaleByLang(lang: string): Locale {
  return localeMap[lang] || enUS;
}

// Converts a date string to API format (UTC ISO string)
export function toIsoDate(date: string | Date): string {
  return new Date(date).toISOString();
}

// Parses an ISO string to a Date object
export function fromApiDate(dateString: string): Date {
  return parseISO(dateString);
}

// Returns the UTC ISO string for the start of the day
export function getStartOfDayUTC(date: Date): string {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  );
  return toIsoDate(utc);
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
  return toIsoDate(utc);
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
  return toIsoDate(new Date());
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

export function getAnalyticsDateRange(): { from: string; to: string } {
  const today = startOfDay(new Date());
  const thirtyDaysAgo = startOfDay(subDays(today, 30));

  return {
    from: getStartOfDayUTC(thirtyDaysAgo),
    to: getStartOfDayUTC(today),
  };
}

export function dateToUrlParam(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function urlParamToDate(dateString: string): Date | null {
  try {
    const parsed = parseISO(dateString);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getDefaultDateFromUrl(): Date {
  if (typeof window === 'undefined') {
    return new Date();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const dateParam = urlParams.get('date');

  if (dateParam) {
    const parsedDate = urlParamToDate(dateParam);
    if (parsedDate && parsedDate <= new Date()) {
      return parsedDate;
    }
  }

  return new Date();
}

export function updateUrlWithDate(date: Date): void {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  const dateParam = dateToUrlParam(date);

  url.searchParams.set('date', dateParam);

  window.history.replaceState({}, '', url.toString());
}

export function useDateFromUrl() {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setSelectedDate(getDefaultDateFromUrl());

    const handlePopState = () => {
      setSelectedDate(getDefaultDateFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateDate = React.useCallback((date: Date) => {
    setSelectedDate(date);
    updateUrlWithDate(date);
  }, []);

  return { selectedDate, updateDate };
}

export function weekToUrlParam(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function urlParamToWeek(dateString: string): Date | null {
  try {
    const parsed = parseISO(dateString);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getDefaultWeekFromUrl(): Date {
  if (typeof window === 'undefined') {
    return new Date();
  }

  const urlParams = new URLSearchParams(window.location.search);
  const weekParam = urlParams.get('week');

  if (weekParam) {
    const parsedWeek = urlParamToWeek(weekParam);
    if (parsedWeek && parsedWeek <= new Date()) {
      return parsedWeek;
    }
  }

  return new Date();
}

export function updateUrlWithWeek(date: Date): void {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  const weekParam = weekToUrlParam(date);

  url.searchParams.set('week', weekParam);

  window.history.replaceState({}, '', url.toString());
}

export function useWeekFromUrl() {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setSelectedDate(getDefaultWeekFromUrl());

    const handlePopState = () => {
      setSelectedDate(getDefaultWeekFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateWeek = React.useCallback((date: Date) => {
    setSelectedDate(date);
    updateUrlWithWeek(date);
  }, []);

  return { selectedDate, updateWeek };
}
