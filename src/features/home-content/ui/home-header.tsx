'use client';

import { useTranslation } from '@/shared/contexts/translation-context';
import { PageHeader } from '@/shared/ui';

export function HomeHeader() {
  const { t } = useTranslation();

  return (
    <PageHeader title={t('app.title')} description={t('app.description')} />
  );
}
