import type { AISummaryData } from '@/shared/types';
import { SummaryContent } from './summary-content';
import { SummaryHeader } from './summary-header';

interface SummaryProps {
  summary: AISummaryData;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Summary({ summary, onRefresh, isRefreshing }: SummaryProps) {
  return (
    <div className="space-y-4">
      <SummaryHeader onRefresh={onRefresh} isRefreshing={isRefreshing} />
      <SummaryContent summary={summary} />
    </div>
  );
}
