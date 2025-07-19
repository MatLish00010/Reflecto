import { Button } from '@/shared/ui/button';
import { Brain, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/shared/contexts/translation-context';

interface SummaryHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function SummaryHeader({ onRefresh, isRefreshing }: SummaryHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
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
        className="text-xs w-full sm:w-auto"
        disabled={isRefreshing}
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        {isRefreshing ? t('newEntry.savingButton') : t('aiAnalysis.refresh')}
      </Button>
    </div>
  );
}
