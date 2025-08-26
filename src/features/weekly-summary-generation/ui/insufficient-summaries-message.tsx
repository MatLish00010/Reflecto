'use client';

import { useTranslation } from '@/shared/client/contexts/translation-context';

interface InsufficientSummariesMessageProps {
  dailySummariesCount: number;
}

export function InsufficientSummariesMessage({
  dailySummariesCount,
}: InsufficientSummariesMessageProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center space-y-4 p-6">
      <div className="text-2xl font-semibold text-foreground">
        {t('aiAnalysis.insufficientDailySummariesTitle')}
      </div>
      <div className="text-muted-foreground max-w-md mx-auto">
        {t('aiAnalysis.insufficientDailySummariesDescription')}
      </div>
      <div className="text-sm text-muted-foreground">
        {`${dailySummariesCount}/4 ${t('aiAnalysis.dailySummariesCount')}`}
      </div>
    </div>
  );
}
