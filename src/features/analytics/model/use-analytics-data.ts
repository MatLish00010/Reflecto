import { useNotesByDate } from '@/entities/note';
import { useDailySummariesByDateRange } from '@/entities/daily-summary';
import { useWeeklySummaryByDateRange } from '@/entities/weekly-summary';
import { subDays } from 'date-fns';
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

export function useAnalyticsData() {
  const { t } = useTranslation();

  const fromDate = useMemo(() => subDays(new Date(), 30), []);
  const toDate = useMemo(() => new Date(), []);

  // Convert to ISO strings for API calls
  const fromDateISO = useMemo(() => fromDate.toISOString(), [fromDate]);
  const toDateISO = useMemo(() => toDate.toISOString(), [toDate]);

  const {
    data: notes,
    isLoading: notesLoading,
    error: notesError,
  } = useNotesByDate(fromDateISO, toDateISO);
  const {
    data: dailySummaries,
    isLoading: dailyLoading,
    error: dailyError,
  } = useDailySummariesByDateRange(fromDateISO, toDateISO);
  const {
    data: weeklySummaries,
    isLoading: weeklyLoading,
    error: weeklyError,
  } = useWeeklySummaryByDateRange(fromDateISO, toDateISO);

  const isLoading = notesLoading || dailyLoading || weeklyLoading;
  const error = notesError || dailyError || weeklyError;

  const data = useMemo((): AnalyticsData => {
    if (isLoading) {
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
  }, [notes, dailySummaries, weeklySummaries, isLoading, t]);

  return {
    data,
    isLoading,
    error,
    fromDate,
    toDate,
  };
}
