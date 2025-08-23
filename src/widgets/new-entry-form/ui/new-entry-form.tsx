'use client';

import { useEffect, useId, useState } from 'react';
import { useCreateNote } from '@/entities/note';
import { useUser } from '@/entities/user';
import { AudioInputTabs } from '@/features/voice-recording';
import { useAuthModalContext } from '@/shared/contexts/auth-modal-context';
import { useTranslation } from '@/shared/contexts/translation-context';
import { safeSentry } from '@/shared/lib/sentry';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';

export function NewEntryForm() {
  const formId = useId();
  const contentId = useId();

  const [content, setContent] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useTranslation();
  const { showSuccess, showError } = useAlertContext();
  const createNoteMutation = useCreateNote();
  const { isAuthenticated } = useUser();
  const { openModal } = useAuthModalContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRecordingComplete = (text: string) => {
    setContent(prev => prev + (prev ? '\n' : '') + text);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      return;
    }

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
    <div id={formId} className="space-y-3.5">
      <div>
        <Textarea
          id={contentId}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={t('newEntry.contentPlaceholder')}
          className="mb-3.5"
        />
        <AudioInputTabs onAudioProcessed={handleRecordingComplete} />
      </div>
      <Button
        onClick={handleSave}
        variant="gradient"
        className="w-full"
        disabled={!content.trim() || createNoteMutation.isPending}
      >
        {isMounted && createNoteMutation.isPending
          ? t('newEntry.savingButton')
          : t('newEntry.saveButton')}
      </Button>
    </div>
  );
}
