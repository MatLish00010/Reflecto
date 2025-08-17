'use client';

import { useUser } from '@/entities/user';
import { AuthRequiredMessage } from '@/shared/components/auth-required-message';
import { useTranslation } from '@/shared/contexts/translation-context';
import { AnalyticsHeader } from './analytics-header';
import { AnalyticsStatsCards } from './analytics-stats-cards';
import { AnalyticsProductivityCards } from './analytics-productivity-cards';
import { AnalyticsCharts } from './analytics-charts';
import { AnalyticsErrorState } from './analytics-error-state';
import { AnalyticsEmptyState } from './analytics-empty-state';
import { AnalyticsDataLoadingSkeleton } from './analytics-data-loading-skeleton';
import { useAnalyticsData } from '../model/use-analytics-data';

export function Analytics() {
  const { user } = useUser();
  const { t } = useTranslation();
  const { data, isLoading, error, fromDate, toDate } = useAnalyticsData();

  if (!user) {
    return (
      <div className="container mx-auto">
        <AnalyticsHeader fromDate={fromDate} toDate={toDate} />
        <AuthRequiredMessage messageKey="analytics.loginRequired" />
      </div>
    );
  }

  if (isLoading) {
    return <AnalyticsDataLoadingSkeleton fromDate={fromDate} toDate={toDate} />;
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <AnalyticsHeader fromDate={fromDate} toDate={toDate} />
        <AnalyticsErrorState message={error.message} />
      </div>
    );
  }

  const hasData =
    data.notes.length > 0 ||
    data.dailySummaries.length > 0 ||
    data.weeklySummaries.length > 0;

  if (!hasData) {
    return (
      <div className="container mx-auto">
        <AnalyticsHeader fromDate={fromDate} toDate={toDate} />
        <AnalyticsEmptyState />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <AnalyticsHeader fromDate={fromDate} toDate={toDate} />

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t('analytics.overview')}
          </h2>
          <AnalyticsStatsCards
            notes={data.notes}
            dailySummaries={data.dailySummaries}
            weeklySummaries={data.weeklySummaries}
            summaryStats={data.summaryStats}
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t('analytics.productivity')}
          </h2>
          <AnalyticsProductivityCards
            productivityStats={data.productivityStats}
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t('analytics.chartsAndInsights')}
          </h2>
          <AnalyticsCharts
            activityData={data.activityData}
            weeklyActivityData={data.weeklyActivityData}
            contentAnalysisData={data.contentAnalysisData}
            timeAnalysisData={data.timeAnalysisData}
            emotionalData={data.emotionalData}
            comparativeStats={data.comparativeStats}
          />
        </section>
      </div>
    </div>
  );
}
