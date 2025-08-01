import * as Sentry from '@sentry/nextjs';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useMemo } from 'react';
import {
  StickyNote,
  Ruler,
  FileCheck,
  CalendarRange,
  Activity,
  Calculator,
  Type,
} from 'lucide-react';

import {
  Note,
  DailySummary,
  WeeklySummary,
  SummaryStats,
} from '../types/analytics';
import { AnalyticsStatCard } from './analytics-stat-card';
import {
  calculateAverageNoteLength,
  getSummariesCount,
  formatNumber,
} from '../utils/analytics-calculations';
import { CARD_COLOR_SCHEMES } from '@/shared/ui/summary/color-schemes';

interface AnalyticsStatsCardsProps {
  notes: Note[];
  dailySummaries: DailySummary[];
  weeklySummaries: WeeklySummary[];
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
        ...CARD_COLOR_SCHEMES.mainStory,
      },
      {
        title: t('analytics.avgNoteLength'),
        value: calculateAverageNoteLength(notes),
        subtitle: t('analytics.characters'),
        icon: Ruler,
        description: t('analytics.avgNoteLengthDescription'),
        ...CARD_COLOR_SCHEMES.observations,
      },
      {
        title: t('analytics.dailySummaries'),
        value: getSummariesCount(dailySummaries),
        subtitle: t('analytics.generated'),
        icon: FileCheck,
        description: t('analytics.dailySummariesDescription'),
        ...CARD_COLOR_SCHEMES.keyEvents,
      },
      {
        title: t('analytics.weeklySummaries'),
        value: getSummariesCount(weeklySummaries),
        subtitle: t('analytics.generated'),
        icon: CalendarRange,
        description: t('analytics.weeklySummariesDescription'),
        ...CARD_COLOR_SCHEMES.progress,
      },
    ],
    [notes, dailySummaries, weeklySummaries, t]
  );

  const additionalStatsCards = useMemo(
    () => [
      {
        title: t('analytics.mostActiveDay'),
        value: summaryStats.mostActiveDay,
        subtitle: t('analytics.entries'),
        icon: Activity,
        description: t('analytics.mostActiveDayDescription'),
        ...CARD_COLOR_SCHEMES.emotionalMoments,
      },
      {
        title: t('analytics.avgEntriesPerDay'),
        value: summaryStats.avgEntriesPerDay,
        subtitle: t('analytics.last30Days'),
        icon: Calculator,
        description: t('analytics.avgEntriesPerDayDescription'),
        ...CARD_COLOR_SCHEMES.ideas,
      },
      {
        title: t('analytics.totalCharacters'),
        value: formatNumber(summaryStats.totalCharacters),
        subtitle: t('analytics.written'),
        icon: Type,
        description: t('analytics.totalCharactersDescription'),
        ...CARD_COLOR_SCHEMES.cognitivePatterns,
      },
    ],
    [summaryStats, t]
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {statsCards.map((card, index) => (
              <AnalyticsStatCard
                key={index}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                description={card.description}
                icon={card.icon}
                gradientFrom={card.gradientFrom}
                gradientTo={card.gradientTo}
                darkGradientFrom={card.darkGradientFrom}
                darkGradientTo={card.darkGradientTo}
                iconGradientFrom={card.iconGradientFrom}
                iconGradientTo={card.iconGradientTo}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {additionalStatsCards.map((card, index) => (
              <AnalyticsStatCard
                key={index}
                title={card.title}
                value={card.value}
                subtitle={card.subtitle}
                description={card.description}
                icon={card.icon}
                gradientFrom={card.gradientFrom}
                gradientTo={card.gradientTo}
                darkGradientFrom={card.darkGradientFrom}
                darkGradientTo={card.darkGradientTo}
                iconGradientFrom={card.iconGradientFrom}
                iconGradientTo={card.iconGradientTo}
              />
            ))}
          </div>
        </>
      );
    }
  );
}
