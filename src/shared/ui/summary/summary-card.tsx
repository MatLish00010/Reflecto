import { LucideIcon } from 'lucide-react';
import { GradientCard } from '../gradient-card';

interface SummaryCardProps {
  icon: LucideIcon;
  titleKey: string;
  content: string | string[];
  gradientFrom: string;
  gradientTo: string;
  darkGradientFrom: string;
  darkGradientTo: string;
  iconGradientFrom: string;
  iconGradientTo: string;
  className?: string;
}

export function SummaryCard({
  icon,
  titleKey,
  content,
  gradientFrom,
  gradientTo,
  darkGradientFrom,
  darkGradientTo,
  iconGradientFrom,
  iconGradientTo,
  className = '',
}: SummaryCardProps) {
  return (
    <GradientCard
      icon={icon}
      title={titleKey}
      titleKey={titleKey}
      content={content}
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
      darkGradientFrom={darkGradientFrom}
      darkGradientTo={darkGradientTo}
      iconGradientFrom={iconGradientFrom}
      iconGradientTo={iconGradientTo}
      className={className}
      variant="summary"
    />
  );
}
