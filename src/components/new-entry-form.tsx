'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AudioInputTabs } from '@/components/audio-input-tabs';
import { useTranslation } from '@/contexts/translation-context';
import { useAlertContext } from '@/components/alert-provider';
import { useCreateNote } from '@/hooks/use-notes';

export function NewEntryForm() {
  const [content, setContent] = useState('');
  const { t } = useTranslation();
  const { showSuccess, showError } = useAlertContext();
  const createNoteMutation = useCreateNote();

  const handleRecordingComplete = (text: string) => {
    setContent(prev => prev + (prev ? '\n' : '') + text);
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      await createNoteMutation.mutateAsync(content.trim());

      setContent('');
      showSuccess(t('newEntry.saveSuccess'));
    } catch (error) {
      console.error('Error saving note:', error);
      showError(
        error instanceof Error ? error.message : t('newEntry.saveError')
      );
    }
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
        className="w-full"
        disabled={!content.trim() || createNoteMutation.isPending}
      >
        {createNoteMutation.isPending
          ? t('newEntry.savingButton')
          : t('newEntry.saveButton')}
      </Button>
    </div>
  );
}
