'use client';

import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';
import { useTranslation } from '@/shared/contexts/translation-context';

interface AuthRequiredMessageProps {
  messageKey: string;
}

export function AuthRequiredMessage({ messageKey }: AuthRequiredMessageProps) {
  const { t } = useTranslation();
  const { openModal } = useAuthModalContext();

  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground mb-4">{t(messageKey)}</p>
      <button
        type="button"
        onClick={openModal}
        className="text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
      >
        {t('auth.signIn')}
      </button>
    </div>
  );
}
