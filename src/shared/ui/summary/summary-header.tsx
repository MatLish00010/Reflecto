import { Button } from '@/shared/ui/button';
import { Brain, RefreshCw } from '@/shared/icons';
import { useTranslation } from '@/shared/contexts/translation-context';

interface SummaryHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function SummaryHeader({ onRefresh, isRefreshing }: SummaryHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('aiAnalysis.summaryTitle')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('aiAnalysis.summaryDescription')}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="text-xs w-full sm:w-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-200"
        disabled={isRefreshing}
      >
        <RefreshCw
          className={`h-3 w-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
        />
        {isRefreshing ? t('newEntry.savingButton') : t('aiAnalysis.refresh')}
      </Button>
    </div>
  );
}
