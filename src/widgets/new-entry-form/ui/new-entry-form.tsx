'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { AudioInputTabs } from '@/features/voice-recording';
import { useTranslation } from '@/shared/contexts/translation-context';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { useCreateNote } from '@/entities/note';
import { useUser } from '@/entities/user';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';
import { safeSentry } from '@/shared/lib/sentry';

export function NewEntryForm() {
  const [content, setContent] = useState('');
  const { t } = useTranslation();
  const { showSuccess, showError } = useAlertContext();
  const createNoteMutation = useCreateNote();
  const { isAuthenticated } = useUser();
  const { openModal } = useAuthModalContext();

  const handleRecordingComplete = (text: string) => {
    setContent(prev => prev + (prev ? '\n' : '') + text);
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    if (!isAuthenticated) {
      openModal();
      return;
    }
    return safeSentry.startSpanAsync(
      {
        op: 'ui.click',
        name: 'Save Note',
      },
      async span => {
        try {
          span.setAttribute('component', 'NewEntryForm');
          span.setAttribute('action', 'saveNote');
          span.setAttribute('content.length', content.length);

          await createNoteMutation.mutateAsync(content.trim());

          setContent('');
          showSuccess(t('newEntry.saveSuccess'));

          span.setAttribute('success', true);
        } catch (error) {
          safeSentry.captureException(error as Error, {
            tags: {
              component: 'NewEntryForm',
              action: 'saveNote',
            },
            extra: {
              contentLength: content.length,
            },
          });
          span.setAttribute('error', true);

          const { logger } = safeSentry;
          logger.error('Error saving note', {
            component: 'NewEntryForm',
            contentLength: content.length,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          showError(
            error instanceof Error ? error.message : t('newEntry.saveError')
          );
        }
      }
    );
  };

  return (
    <div id="new-entry-form" className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          {t('newEntry.contentLabel')}
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={t('newEntry.contentPlaceholder')}
          className="min-h-[200px]"
        />
        <div className="mt-2">
          <AudioInputTabs onAudioProcessed={handleRecordingComplete} />
        </div>
      </div>
      <Button
        onClick={handleSave}
        className="w-full btn-gradient-scale"
        disabled={!content.trim() || createNoteMutation.isPending}
      >
        {createNoteMutation.isPending
          ? t('newEntry.savingButton')
          : t('newEntry.saveButton')}
      </Button>
    </div>
  );
}
