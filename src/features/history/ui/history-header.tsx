'use client';

import { useTranslation } from '@/shared/contexts/translation-context';
import { PageHeader } from '@/shared/ui';

export function HistoryHeader() {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t('history.title')}
      description={t('history.description')}
    />
  );
}
