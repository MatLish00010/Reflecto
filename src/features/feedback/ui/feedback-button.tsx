'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { FeedbackModal } from './feedback-modal';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useUser } from '@/entities/user';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';
import { Bug } from '@/shared/icons';

interface FeedbackButtonProps {
  variant?: 'default' | 'mobile';
  className?: string;
}

export function FeedbackButton({
  variant = 'default',
  className,
}: FeedbackButtonProps) {
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

  const buttonClassName =
    variant === 'mobile' ? 'w-full justify-start' : 'flex items-center gap-2';

  return (
    <>
      <Button
        variant="outline"
        onClick={handleClick}
        className={`${buttonClassName} ${className || ''}`}
        title={t('feedback.description')}
      >
        <Bug className="h-4 w-4" />
        {variant === 'mobile' && (
          <span className="ml-3">{t('feedback.button')}</span>
        )}
        {variant === 'default' && (
          <span className="hidden sm:inline">{t('feedback.button')}</span>
        )}
      </Button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
