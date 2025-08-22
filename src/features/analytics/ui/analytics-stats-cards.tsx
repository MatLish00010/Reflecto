import * as Sentry from '@sentry/nextjs';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useMemo } from 'react';
import { StickyNote, FileCheck, CalendarRange, Calculator } from 'lucide-react';

import { Note, DailySummary, SummaryStats } from '../types/analytics';
import { AnalyticsStatCard } from './analytics-stat-card';
import { getSummariesCount } from '../utils/analytics-calculations';
import { CARD_COLOR_SCHEMES } from '@/shared/ui/summary/color-schemes';
import type { AISummaryData } from '@/shared/types';

interface AnalyticsStatsCardsProps {
  notes: Note[];
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {statsCards.map((card, index) => (
            <AnalyticsStatCard
              key={index}
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
