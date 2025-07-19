export function getStartOfDayUTC(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const utcDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  return utcDate.toISOString();
}

export function getEndOfDayUTC(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const utcDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  return utcDate.toISOString();
}

export function getDateRangeUTC(date: Date): { from: string; to: string } {
  return {
    from: getStartOfDayUTC(date),
    to: getEndOfDayUTC(date),
  };
}

export function getCurrentDateUTC(): string {
  return new Date().toISOString();
}
