import { useTranslation } from '@/shared/client/contexts/translation-context';
import { PageHeader } from '@/shared/client/ui';

export function AnalyticsHeader() {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t('analytics.title')}
      description={t('analytics.description')}
    />
  );
}
