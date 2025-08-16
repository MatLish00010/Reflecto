import { useNotesByDate } from '@/entities/note';
import { useDailySummaries } from '@/entities/daily-summary';
import { useWeeklySummaries } from '@/entities/weekly-summary';
import { useMemo } from 'react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { AnalyticsData } from '../types/analytics';
import {
  prepareActivityData,
  prepareWeeklyActivityData,
  prepareContentAnalysisData,
  prepareTimeAnalysisData,
  prepareSummaryStats,
  prepareProductivityStats,
  prepareEmotionalData,
  prepareComparativeStats,
} from '../utils/analytics-data-helpers';
import { getAnalyticsDateRange } from '@/shared/lib/date-utils';

export function useAnalyticsData() {
  const { t } = useTranslation();

  const { from: fromDate, to: toDate } = useMemo(
    () => getAnalyticsDateRange(),
    []
  );

  // Convert to ISO strings for API calls
  const fromISO = useMemo(() => new Date(fromDate).toISOString(), [fromDate]);
  const toISO = useMemo(() => new Date(toDate).toISOString(), [toDate]);

  const {
    data: notes,
    isLoading: notesLoading,
    error: notesError,
  } = useNotesByDate(fromISO, toISO);
  const {
    data: dailySummaries,
    isLoading: dailyLoading,
    error: dailyError,
  } = useDailySummaries(fromISO, toISO);
  const {
    data: weeklySummaries,
    isLoading: weeklyLoading,
    error: weeklyError,
  } = useWeeklySummaries(fromISO, toISO);

  const hasAnyData =
    (notes?.length ?? 0) > 0 ||
    (dailySummaries?.length ?? 0) > 0 ||
    (weeklySummaries?.length ?? 0) > 0;

  const isLoading =
    !hasAnyData && (notesLoading || dailyLoading || weeklyLoading);
  const error = notesError || dailyError || weeklyError;

  const data = useMemo((): AnalyticsData => {
    if (isLoading && !hasAnyData) {
      return {
        notes: [],
        dailySummaries: [],
        weeklySummaries: [],
        activityData: [],
        weeklyActivityData: [],
        contentAnalysisData: { lengthDistribution: [], weekdayActivity: [] },
        timeAnalysisData: [],
        summaryStats: {
          mostActiveDay: '0',
          avgEntriesPerDay: '0',
          totalCharacters: 0,
        },
        productivityStats: {
          completionRate: 0,
          currentStreak: 0,
          longestStreak: 0,
          longestNote: 0,
        },
        emotionalData: { weekdayProductivity: [] },
        comparativeStats: {
          currentMonth: 0,
          previousMonth: 0,
          improvement: 0,
        },
      };
    }

    const notesArray = Array.isArray(notes) ? notes : [];
    const dailySummariesArray = Array.isArray(dailySummaries)
      ? dailySummaries
      : [];
    const weeklySummariesArray = Array.isArray(weeklySummaries)
      ? weeklySummaries
      : [];

    return {
      notes: notesArray,
      dailySummaries: dailySummariesArray,
      weeklySummaries: weeklySummariesArray,
      activityData: prepareActivityData(notesArray),
      weeklyActivityData: prepareWeeklyActivityData(notesArray),
      contentAnalysisData: prepareContentAnalysisData(notesArray, t),
      timeAnalysisData: prepareTimeAnalysisData(notesArray),
      summaryStats: prepareSummaryStats(notesArray),
      productivityStats: prepareProductivityStats(notesArray),
      emotionalData: prepareEmotionalData(notesArray, t),
      comparativeStats: prepareComparativeStats(notesArray),
    };
  }, [notes, dailySummaries, weeklySummaries, isLoading, hasAnyData, t]);

  return {
    data,
    isLoading,
    error,
    fromDate,
    toDate,
  };
}
