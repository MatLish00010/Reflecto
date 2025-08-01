import { format, subDays, startOfWeek, parseISO, getHours } from 'date-fns';
import {
  Note,
  ActivityDataPoint,
  WeeklyActivityDataPoint,
  ContentAnalysisData,
  TimeAnalysisDataPoint,
  SummaryStats,
  ProductivityStats,
  EmotionalData,
  ComparativeStats,
} from '../types/analytics';

export function prepareActivityData(notes: Note[]): ActivityDataPoint[] {
  const activityMap = new Map<string, number>();

  notes.forEach(note => {
    const date = format(parseISO(note.created_at), 'yyyy-MM-dd');
    activityMap.set(date, (activityMap.get(date) || 0) + 1);
  });

  const result = [];
  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    result.push({
      date,
      count: activityMap.get(date) || 0,
    });
  }

  return result;
}

export function prepareWeeklyActivityData(
  notes: Note[]
): WeeklyActivityDataPoint[] {
  const weeklyMap = new Map<string, number>();

  notes.forEach(note => {
    const date = parseISO(note.created_at);
    const weekStart = format(
      startOfWeek(date, { weekStartsOn: 1 }),
      'yyyy-MM-dd'
    );
    weeklyMap.set(weekStart, (weeklyMap.get(weekStart) || 0) + 1);
  });

  return Array.from(weeklyMap.entries()).map(([week, count]) => ({
    week: format(parseISO(week), 'dd.MM'),
    count,
  }));
}

export function prepareContentAnalysisData(
  notes: Note[],
  t: (key: string) => string
): ContentAnalysisData {
  const lengthDistribution = [
    {
      name: t('analytics.noteLengths.short'),
      value: notes.filter(n => (n.note?.length || 0) < 100).length,
      key: 'analytics.noteLengths.short',
    },
    {
      name: t('analytics.noteLengths.medium'),
      value: notes.filter(
        n => (n.note?.length || 0) >= 100 && (n.note?.length || 0) < 300
      ).length,
      key: 'analytics.noteLengths.medium',
    },
    {
      name: t('analytics.noteLengths.long'),
      value: notes.filter(
        n => (n.note?.length || 0) >= 300 && (n.note?.length || 0) < 500
      ).length,
      key: 'analytics.noteLengths.long',
    },
    {
      name: t('analytics.noteLengths.veryLong'),
      value: notes.filter(n => (n.note?.length || 0) >= 500).length,
      key: 'analytics.noteLengths.veryLong',
    },
  ];

  const weekdayActivity = new Array(7).fill(0);
  notes.forEach(note => {
    const date = parseISO(note.created_at);
    const dayOfWeek = date.getDay();
    weekdayActivity[dayOfWeek === 0 ? 6 : dayOfWeek - 1]++;
  });

  return {
    lengthDistribution,
    weekdayActivity,
  };
}

export function prepareTimeAnalysisData(
  notes: Note[]
): TimeAnalysisDataPoint[] {
  const hourMap = new Map<number, number>();

  notes.forEach(note => {
    const date = parseISO(note.created_at);
    const hour = getHours(date);
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });

  const result = [];
  for (let hour = 0; hour < 24; hour++) {
    result.push({
      hour: `${hour}:00`,
      count: hourMap.get(hour) || 0,
    });
  }

  return result;
}

export function prepareSummaryStats(notes: Note[]): SummaryStats {
  const dayMap = new Map<string, number>();
  notes.forEach(note => {
    const date = format(parseISO(note.created_at), 'yyyy-MM-dd');
    dayMap.set(date, (dayMap.get(date) || 0) + 1);
  });

  let mostActiveDay = 0;
  let mostActiveDate = '';
  dayMap.forEach((count, date) => {
    if (count > mostActiveDay) {
      mostActiveDay = count;
      mostActiveDate = date;
    }
  });

  const avgEntriesPerDay =
    notes.length > 0 ? (notes.length / 30).toFixed(1) : '0';

  const totalCharacters = notes.reduce(
    (acc, note) => acc + (note.note?.length || 0),
    0
  );

  return {
    mostActiveDay:
      mostActiveDay > 0
        ? `${mostActiveDay} (${format(parseISO(mostActiveDate), 'dd.MM')})`
        : '0',
    avgEntriesPerDay,
    totalCharacters,
  };
}

export function prepareProductivityStats(notes: Note[]): ProductivityStats {
  const daysWithEntries = new Set();
  notes.forEach(note => {
    const date = format(parseISO(note.created_at), 'yyyy-MM-dd');
    daysWithEntries.add(date);
  });

  const completionRate = Math.round((daysWithEntries.size / 30) * 100);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let isCurrentStreakActive = false;

  for (let i = 0; i < 30; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');

    if (daysWithEntries.has(date)) {
      tempStreak++;
      if (i === 0) {
        currentStreak = tempStreak;
        isCurrentStreakActive = true;
      }
    } else {
      if (i === 0) {
        currentStreak = 0;
        isCurrentStreakActive = false;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 0;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  const longestNote = notes.reduce(
    (max, note) => Math.max(max, note.note?.length || 0),
    0
  );

  return {
    completionRate,
    currentStreak: isCurrentStreakActive ? currentStreak : 0,
    longestStreak,
    longestNote,
  };
}

export function prepareEmotionalData(
  notes: Note[],
  t: (key: string) => string
): EmotionalData {
  const weekdayProductivity = [
    {
      day: t('analytics.weekdays.mon'),
      productivity: 0,
      dayKey: 'analytics.weekdays.mon',
    },
    {
      day: t('analytics.weekdays.tue'),
      productivity: 0,
      dayKey: 'analytics.weekdays.tue',
    },
    {
      day: t('analytics.weekdays.wed'),
      productivity: 0,
      dayKey: 'analytics.weekdays.wed',
    },
    {
      day: t('analytics.weekdays.thu'),
      productivity: 0,
      dayKey: 'analytics.weekdays.thu',
    },
    {
      day: t('analytics.weekdays.fri'),
      productivity: 0,
      dayKey: 'analytics.weekdays.fri',
    },
    {
      day: t('analytics.weekdays.sat'),
      productivity: 0,
      dayKey: 'analytics.weekdays.sat',
    },
    {
      day: t('analytics.weekdays.sun'),
      productivity: 0,
      dayKey: 'analytics.weekdays.sun',
    },
  ];

  const weekdayCounts = new Array(7).fill(0);
  const weekdayDays = new Array(7).fill(0);

  for (let i = 0; i < 30; i++) {
    const date = subDays(new Date(), i);
    const dayOfWeek = date.getDay();
    const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekdayDays[index]++;
  }

  notes.forEach(note => {
    const date = parseISO(note.created_at);
    const dayOfWeek = date.getDay();
    const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    weekdayCounts[index]++;
  });

  weekdayProductivity.forEach((day, index) => {
    const totalDays = weekdayDays[index];
    const totalEntries = weekdayCounts[index];
    day.productivity =
      totalDays > 0 ? Math.round((totalEntries / totalDays) * 10) / 10 : 0;
  });

  return {
    weekdayProductivity,
  };
}

export function prepareComparativeStats(notes: Note[]): ComparativeStats {
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  let currentMonthCount = 0;
  let previousMonthCount = 0;

  notes.forEach(note => {
    const noteDate = parseISO(note.created_at);
    if (noteDate >= currentMonthStart) {
      currentMonthCount++;
    } else if (noteDate >= previousMonthStart && noteDate <= previousMonthEnd) {
      previousMonthCount++;
    }
  });

  const improvement =
    previousMonthCount > 0
      ? Math.round(
          ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
        )
      : currentMonthCount > 0
        ? 100
        : 0;

  return {
    currentMonth: currentMonthCount,
    previousMonth: previousMonthCount,
    improvement,
  };
}
