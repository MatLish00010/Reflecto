import { useTranslation } from '@/shared/contexts/translation-context';
import { useFormatters } from '@/shared/hooks';

interface PeriodDisplayProps {
  fromDate: Date;
  toDate: Date;
}

export function PeriodDisplay({ fromDate, toDate }: PeriodDisplayProps) {
  const { t } = useTranslation();
  const { formatDate } = useFormatters();

  return (
    <div className="flex flex-col items-start sm:items-end gap-1">
      <div className="text-sm font-medium text-muted-foreground">
        {t('analytics.period')}
      </div>
      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {formatDate(fromDate, 'LONG')} - {formatDate(toDate, 'LONG')}
      </div>
    </div>
  );
}
