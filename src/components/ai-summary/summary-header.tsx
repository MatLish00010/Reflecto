import { Button } from '@/components/ui/button';
import { Brain, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/contexts/translation-context';

interface SummaryHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function SummaryHeader({ onRefresh, isRefreshing }: SummaryHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {t('aiAnalysis.summaryTitle')}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="text-xs"
        disabled={isRefreshing}
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        {isRefreshing ? t('newEntry.savingButton') : t('aiAnalysis.refresh')}
      </Button>
    </div>
  );
}
