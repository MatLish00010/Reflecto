'use client';

import { useTranslation } from '@/shared/client/contexts/translation-context';
import { PageHeader } from '@/shared/client/ui';

export function HistoryHeader() {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t('history.title')}
      description={t('history.description')}
    />
  );
}
