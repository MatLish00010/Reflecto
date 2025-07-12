'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AudioInputTabs } from '@/components/audio-input-tabs';
import { useTranslation } from '@/contexts/translation-context';
import { useUserContext } from '@/contexts/user-context';
import { useAlertContext } from '@/components/alert-provider';

export function NewEntryForm() {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();
  const { user } = useUserContext();
  const { showSuccess, showError } = useAlertContext();

  const handleRecordingComplete = (text: string) => {
    setContent(prev => prev + (prev ? '\n' : '') + text);
  };

  const handleSave = async () => {
    if (!user || !content.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note: content.trim(),
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save note');
      }

      const { note } = await response.json();
      console.log('Note saved successfully:', note);

      // Clear the form after successful save
      setContent('');
      showSuccess(t('newEntry.saveSuccess'));
    } catch (error) {
      console.error('Error saving note:', error);
      showError(t('newEntry.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
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
        disabled={!content.trim() || !user || isSaving}
      >
        {isSaving ? t('newEntry.savingButton') : t('newEntry.saveButton')}
      </Button>
    </div>
  );
}
