import { Button } from '@/shared/ui/button';
import { RefreshCw } from '@/shared/icons';
import { useTranslation } from '@/shared/contexts/translation-context';

interface SummaryHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function SummaryHeader({ onRefresh, isRefreshing }: SummaryHeaderProps) {
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onRefresh}
      disabled={isRefreshing}
      className="w-full md:w-max"
    >
      <RefreshCw
        className={`h-3 w-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
      />
      {isRefreshing ? t('newEntry.savingButton') : t('aiAnalysis.refresh')}
    </Button>
  );
}
