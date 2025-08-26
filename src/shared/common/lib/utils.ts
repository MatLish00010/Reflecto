import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function translate(dict: Record<string, unknown>, key: string): string {
  const keys = key.split('.');
  let value: unknown = dict;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

export function getWeekdays(t: (key: string) => string) {
  return [
    t('analytics.weekdays.mon'),
    t('analytics.weekdays.tue'),
    t('analytics.weekdays.wed'),
    t('analytics.weekdays.thu'),
    t('analytics.weekdays.fri'),
    t('analytics.weekdays.sat'),
    t('analytics.weekdays.sun'),
  ];
}
