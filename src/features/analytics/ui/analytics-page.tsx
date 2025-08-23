'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useUser } from '@/entities/user';
import { AuthRequiredMessage } from '@/shared/components/auth-required-message';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useAnalyticsData } from '../model/use-analytics-data';
import {
  AnalyticsCardSkeleton,
  AnalyticsChartSkeleton,
} from './analytics-card-skeleton';
import { AnalyticsDataLoadingSkeleton } from './analytics-data-loading-skeleton';
import { AnalyticsEmptyState } from './analytics-empty-state';
import { AnalyticsErrorState } from './analytics-error-state';
import { AnalyticsHeader } from './analytics-header';

const AnalyticsCharts = dynamic(
  () =>
    import('./analytics-charts').then(mod => ({
      default: mod.AnalyticsCharts,
    })),
  {
    loading: () => <AnalyticsChartSkeleton />,
    ssr: false,
  }
);

const AnalyticsStatsCards = dynamic(
  () =>
    import('./analytics-stats-cards').then(mod => ({
      default: mod.AnalyticsStatsCards,
    })),
  {
    loading: () => (
      <AnalyticsCardSkeleton
        count={4}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      />
    ),
    ssr: true,
  }
);

const AnalyticsProductivityCards = dynamic(
  () =>
    import('./analytics-productivity-cards').then(mod => ({
      default: mod.AnalyticsProductivityCards,
    })),
  {
    loading: () => (
      <AnalyticsCardSkeleton
        count={4}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      />
    ),
    ssr: true,
  }
);

export function Analytics() {
  const { user } = useUser();
  const { t } = useTranslation();
  const { data, isLoading, error } = useAnalyticsData();

  const memoizedData = useMemo(
    () => ({
      notes: data?.notes || [],
      dailySummaries: data?.dailySummaries || [],
      weeklySummaries: data?.weeklySummaries || [],
      summaryStats: data?.summaryStats || {
        mostActiveDay: '0',
        avgEntriesPerDay: '0',
        totalCharacters: 0,
      },
      productivityStats: data?.productivityStats || {
        completionRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        longestNote: 0,
      },
      activityData: data?.activityData || [],
      weeklyActivityData: data?.weeklyActivityData || [],
      contentAnalysisData: data?.contentAnalysisData || {
        lengthDistribution: [],
        weekdayActivity: [],
      },
      timeAnalysisData: data?.timeAnalysisData || [],
      emotionalData: data?.emotionalData || { weekdayProductivity: [] },
      comparativeStats: data?.comparativeStats || {
        currentMonth: 0,
        previousMonth: 0,
        improvement: 0,
      },
    }),
    [data]
  );

  if (!user) {
    return (
      <div className="container mx-auto">
        <AnalyticsHeader />
        <AuthRequiredMessage messageKey="analytics.loginRequired" />
      </div>
    );
  }

  if (isLoading) {
    return <AnalyticsDataLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <AnalyticsHeader />
        <AnalyticsErrorState message={error.message} />
      </div>
    );
  }

  const hasData =
    memoizedData.notes.length > 0 ||
    memoizedData.dailySummaries.length > 0 ||
    memoizedData.weeklySummaries.length > 0;

  if (!hasData) {
    return (
      <div className="container mx-auto">
        <AnalyticsHeader />
        <AnalyticsEmptyState />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <AnalyticsHeader />

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t('analytics.overview')}
          </h2>
          <AnalyticsStatsCards
            notes={memoizedData.notes}
            dailySummaries={memoizedData.dailySummaries}
            weeklySummaries={memoizedData.weeklySummaries}
            summaryStats={memoizedData.summaryStats}
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t('analytics.productivity')}
          </h2>
          <AnalyticsProductivityCards
            productivityStats={memoizedData.productivityStats}
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t('analytics.chartsAndInsights')}
          </h2>
          <AnalyticsCharts
            activityData={memoizedData.activityData}
            weeklyActivityData={memoizedData.weeklyActivityData}
            contentAnalysisData={memoizedData.contentAnalysisData}
            timeAnalysisData={memoizedData.timeAnalysisData}
            emotionalData={memoizedData.emotionalData}
            comparativeStats={memoizedData.comparativeStats}
          />
        </section>
      </div>
    </div>
  );
}
