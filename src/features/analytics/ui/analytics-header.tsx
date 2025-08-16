import { useTranslation } from '@/shared/contexts/translation-context';
import { PageHeader, PeriodDisplay } from '@/shared/ui';

interface AnalyticsHeaderProps {
  fromDate: Date | string;
  toDate: Date | string;
}

export function AnalyticsHeader({ fromDate, toDate }: AnalyticsHeaderProps) {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t('analytics.title')}
      description={t('analytics.description')}
      rightContent={<PeriodDisplay fromDate={fromDate} toDate={toDate} />}
    />
  );
}
