'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { FeedbackModal } from './feedback-modal';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useUser } from '@/entities/user';
import { Bug } from 'lucide-react';

export function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2"
        title={t('feedback.description')}
      >
        <Bug className="h-4 w-4" />
        {t('feedback.button')}
      </Button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
