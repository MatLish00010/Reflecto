import { memo, type ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

interface AnalyticsChartWrapperProps {
  children: ReactElement;
  height?: number;
  className?: string;
}

export const AnalyticsChartWrapper = memo(function AnalyticsChartWrapper({
  children,
  height = 400,
  className,
}: AnalyticsChartWrapperProps) {
  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      {children}
    </ResponsiveContainer>
  );
});
