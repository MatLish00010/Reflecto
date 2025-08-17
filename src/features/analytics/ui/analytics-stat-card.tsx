import { memo } from 'react';
import { LucideIcon } from '@/shared/icons';
import { GradientCard } from '@/shared/ui/gradient-card';

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  className?: string;
  description?: string;
  gradientFrom: string;
  gradientTo: string;
  darkGradientFrom: string;
  darkGradientTo: string;
  iconGradientFrom: string;
  iconGradientTo: string;
}

export const AnalyticsStatCard = memo(function AnalyticsStatCard({
  title,
  value,
  subtitle,
  icon,
  className = '',
  description,
  gradientFrom,
  gradientTo,
  darkGradientFrom,
  darkGradientTo,
  iconGradientFrom,
  iconGradientTo,
}: AnalyticsStatCardProps) {
  return (
    <GradientCard
      icon={icon}
      title={title}
      value={value}
      subtitle={subtitle}
      description={description}
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
      darkGradientFrom={darkGradientFrom}
      darkGradientTo={darkGradientTo}
      iconGradientFrom={iconGradientFrom}
      iconGradientTo={iconGradientTo}
      className={className}
      variant="stats"
    />
  );
});
