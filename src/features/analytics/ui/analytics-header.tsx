import { useTranslation } from '@/shared/contexts/translation-context';
import { PageHeader } from '@/shared/ui';

export function AnalyticsHeader() {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t('analytics.title')}
      description={t('analytics.description')}
    />
  );
}
