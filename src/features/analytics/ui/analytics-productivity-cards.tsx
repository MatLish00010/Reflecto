import * as Sentry from '@sentry/nextjs';
import { memo, useMemo } from 'react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { AlignLeft, Medal, Percent, Zap } from '@/shared/icons';
import { CARD_COLOR_SCHEMES } from '@/shared/ui/summary/color-schemes';
import type { ProductivityStats } from '../types/analytics';
import { AnalyticsStatCard } from './analytics-stat-card';

interface AnalyticsProductivityCardsProps {
  productivityStats: ProductivityStats;
}

export const AnalyticsProductivityCards = memo(
  function AnalyticsProductivityCards({
    productivityStats,
  }: AnalyticsProductivityCardsProps) {
    const { t } = useTranslation();

    const productivityCards = useMemo(
      () => [
        {
          title: t('analytics.completionRate'),
          value: `${productivityStats.completionRate}%`,
          subtitle: t('analytics.daysWithEntries'),
          icon: Percent,
          description: t('analytics.completionRateDescription'),
          ...CARD_COLOR_SCHEMES.resources,
        },
        {
          title: t('analytics.currentStreak'),
          value: productivityStats.currentStreak,
          subtitle: t('analytics.daysInRow'),
          icon: Zap,
          description: t('analytics.currentStreakDescription'),
          ...CARD_COLOR_SCHEMES.progress,
        },
        {
          title: t('analytics.longestStreak'),
          value: productivityStats.longestStreak,
          subtitle: t('analytics.daysInRow'),
          icon: Medal,
          description: t('analytics.longestStreakDescription'),
          ...CARD_COLOR_SCHEMES.emotionalMoments,
        },
        {
          title: t('analytics.longestNote'),
          value: productivityStats.longestNote,
          subtitle: t('analytics.characters'),
          icon: AlignLeft,
          description: t('analytics.longestNoteDescription'),
          ...CARD_COLOR_SCHEMES.observations,
        },
      ],
      [productivityStats, t]
    );

    return Sentry.startSpan(
      {
        op: 'ui.component',
        name: 'Analytics Productivity Cards Render',
      },
      span => {
        span.setAttribute('completionRate', productivityStats.completionRate);
        span.setAttribute('currentStreak', productivityStats.currentStreak);
        span.setAttribute('longestStreak', productivityStats.longestStreak);
        span.setAttribute('longestNote', productivityStats.longestNote);

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {productivityCards.map((card, index) => (
              <AnalyticsStatCard
                key={`productivity-${card.title}-${index}`}
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
);
