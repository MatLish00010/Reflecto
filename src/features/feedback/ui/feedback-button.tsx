'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { FeedbackModal } from './feedback-modal';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useUser } from '@/entities/user';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';
import { Bug } from 'lucide-react';

export function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const { isAuthenticated } = useUser();
  const { openModal } = useAuthModalContext();

  const handleClick = () => {
    if (!isAuthenticated) {
      openModal();
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="flex items-center gap-2"
        title={t('feedback.description')}
      >
        <Bug className="h-4 w-4" />
        <span className="hidden sm:inline">{t('feedback.button')}</span>
      </Button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
