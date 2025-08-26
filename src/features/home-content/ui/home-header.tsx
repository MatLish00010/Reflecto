'use client';

import { useTranslation } from '@/shared/client/contexts/translation-context';
import { PageHeader } from '@/shared/client/ui';

export function HomeHeader() {
  const { t } = useTranslation();

  return (
    <PageHeader title={t('app.title')} description={t('app.description')} />
  );
}
