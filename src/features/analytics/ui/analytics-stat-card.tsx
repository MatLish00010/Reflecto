import { memo } from 'react';
import type { LucideIcon } from '@/shared/icons';
import { StatisticCard } from '@/shared/ui/statistic-card';

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  className?: string;
  description?: string;
  color: string;
}

export const AnalyticsStatCard = memo(function AnalyticsStatCard({
  title,
  value,
  subtitle,
  icon,
  className = '',
  description,
  color,
}: AnalyticsStatCardProps) {
  return (
    <StatisticCard
      icon={icon}
      title={title}
      value={value}
      subtitle={subtitle}
      description={description}
      color={color}
      className={className}
      variant="stats"
    />
  );
});
