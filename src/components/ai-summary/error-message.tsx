import { useTranslation } from '@/contexts/translation-context';

export function ErrorMessage() {
  const { t } = useTranslation();

  return (
    <div className="text-center py-8 text-red-500 dark:text-red-400">
      <p>{t('aiAnalysis.fetchError')}</p>
    </div>
  );
}
