import { SummaryHeader } from './summary-header';
import { SummaryContent } from './summary-content';
import { AISummaryData } from '@/shared/types';

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
