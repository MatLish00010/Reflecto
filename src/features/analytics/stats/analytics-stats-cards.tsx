import * as Sentry from '@sentry/nextjs';
import { Calculator, CalendarRange, FileCheck, StickyNote } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { CARD_COLOR_SCHEMES } from '@/shared/client/ui/summary/color-schemes';
import type {
  AISummaryData,
  AnalyticsNote,
  DailySummary,
  SummaryStats,
} from '@/shared/common/types';
import { getSummariesCount } from '../utils/analytics-calculations';
import { AnalyticsStatCard } from './analytics-stat-card';

interface AnalyticsStatsCardsProps {
  notes: AnalyticsNote[];
  dailySummaries: DailySummary[];
  weeklySummaries: AISummaryData[];
  summaryStats: SummaryStats;
}

export function AnalyticsStatsCards({
  notes,
  dailySummaries,
  weeklySummaries,
  summaryStats,
}: AnalyticsStatsCardsProps) {
  const { t } = useTranslation();

  const statsCards = useMemo(
    () => [
      {
        title: t('analytics.totalNotes'),
        value: notes?.length || 0,
        subtitle: t('analytics.last30Days'),
        icon: StickyNote,
        description: t('analytics.totalNotesDescription'),
        color: CARD_COLOR_SCHEMES.mainStory.color,
      },
      {
        title: t('analytics.dailySummaries'),
        value: getSummariesCount(dailySummaries),
        subtitle: t('analytics.generated'),
        icon: FileCheck,
        description: t('analytics.dailySummariesDescription'),
        color: CARD_COLOR_SCHEMES.keyEvents.color,
      },
      {
        title: t('analytics.weeklySummaries'),
        value: getSummariesCount(weeklySummaries),
        subtitle: t('analytics.generated'),
        icon: CalendarRange,
        description: t('analytics.weeklySummariesDescription'),
        color: CARD_COLOR_SCHEMES.progress.color,
      },
      {
        title: t('analytics.avgEntriesPerDay'),
        value: summaryStats.avgEntriesPerDay,
        subtitle: t('analytics.last30Days'),
        icon: Calculator,
        description: t('analytics.avgEntriesPerDayDescription'),
        color: CARD_COLOR_SCHEMES.ideas.color,
      },
    ],
    [notes, dailySummaries, weeklySummaries, summaryStats, t]
  );

  return Sentry.startSpan(
    {
      op: 'ui.component',
      name: 'Analytics Stats Cards Render',
    },
    span => {
      span.setAttribute('notes.count', notes.length);
      span.setAttribute('dailySummaries.count', dailySummaries.length);
      span.setAttribute('weeklySummaries.count', weeklySummaries.length);
      span.setAttribute('hasSummaryStats', !!summaryStats);

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {statsCards.map((card, index) => (
            <AnalyticsStatCard
              key={`stats-${card.title}-${index}`}
              title={card.title}
              value={card.value}
              subtitle={card.subtitle}
              description={card.description}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>
      );
    }
  );
}
