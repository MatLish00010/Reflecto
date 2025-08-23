'use client';

import { useId, useState } from 'react';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { useCreateFeedback } from '../model/use-feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const typeId = useId();
  const titleId = useId();
  const descriptionId = useId();

  const [type, setType] = useState<'bug' | 'feature' | 'improvement'>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const createFeedback = useCreateFeedback();
  const { showSuccess, showError } = useAlertContext();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      showError(t('feedback.submitError'));
      return;
    }

    try {
      await createFeedback.mutateAsync({
        type,
        title: title.trim(),
        description: description.trim(),
      });

      showSuccess(t('feedback.submitSuccess'));
      handleClose();
    } catch {
      showError(t('feedback.submitError'));
    }
  };

  const handleClose = () => {
    setType('bug');
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('feedback.modalTitle')}</DialogTitle>
          <DialogDescription>
            {t('feedback.modalDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor={typeId} className="text-sm font-medium">
              {t('feedback.typeLabel')}
            </label>
            <select
              id={typeId}
              value={type}
              onChange={e =>
                setType(e.target.value as 'bug' | 'feature' | 'improvement')
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white cursor-pointer"
            >
              <option value="bug">{t('feedback.typeBug')}</option>
              <option value="feature">{t('feedback.typeFeature')}</option>
              <option value="improvement">
                {t('feedback.typeImprovement')}
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor={titleId} className="text-sm font-medium">
              {t('feedback.titleLabel')}
            </label>
            <Input
              id={titleId}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('feedback.titlePlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor={descriptionId} className="text-sm font-medium">
              {t('feedback.descriptionLabel')}
            </label>
            <Textarea
              id={descriptionId}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('feedback.descriptionPlaceholder')}
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              {t('feedback.closeButton')}
            </Button>
            <Button
              type="submit"
              disabled={createFeedback.isPending}
              className="flex-1"
            >
              {createFeedback.isPending
                ? t('feedback.submittingButton')
                : t('feedback.submitButton')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
