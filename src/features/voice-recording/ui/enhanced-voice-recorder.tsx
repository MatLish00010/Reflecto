'use client';

import { useState, useRef } from 'react';
import { Button } from '@/shared/ui/button';
import { Mic, Square, RotateCcw } from 'lucide-react';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { useTranslation } from '@/shared/contexts/translation-context';

interface EnhancedVoiceRecorderProps {
  onRecordingComplete: (text: string) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  disabled?: boolean;
}

export function EnhancedVoiceRecorder({
  onRecordingComplete,
  isRecording,
  onRecordingChange,
  disabled = false,
}: EnhancedVoiceRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isResetRef = useRef(false);
  const { showError } = useAlertContext();
  const { t } = useTranslation();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Если запись была сброшена, не обрабатываем аудио
        if (isResetRef.current) {
          isResetRef.current = false;
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/wav',
        });

        try {
          const formData = new FormData();
          formData.append('audio', audioBlob);

          const response = await fetch('/api/speech-to-text', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.error || t('newEntry.voiceRecording.errorMessage')
            );
          }

          const { text } = await response.json();
          onRecordingComplete(text);
        } catch (error) {
          console.error('Error processing audio:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : t('newEntry.voiceRecording.errorMessage');
          showError(errorMessage);
          onRecordingComplete('');
        } finally {
          setIsProcessing(false);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      onRecordingChange(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('newEntry.voiceRecording.errorAccessingMicrophone');
      showError(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      onRecordingChange(false);
    }
  };

  const resetRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      isResetRef.current = true;
      mediaRecorderRef.current.stop();
      onRecordingChange(false);
    }

    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
  };

  if (isProcessing) {
    return (
      <div className="space-y-2">
        <Button variant="outline" disabled className="w-full">
          <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
          {t('newEntry.voiceRecording.processingText')}
        </Button>
        <div className="text-sm text-muted-foreground text-center">
          {t('newEntry.voiceRecording.speechRecognition')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {!isRecording ? (
          <Button
            onClick={startRecording}
            disabled={disabled}
            variant="outline"
            className="flex-1"
          >
            <Mic className="w-4 h-4 mr-2" />
            {t('newEntry.voiceRecording.startButton')}
          </Button>
        ) : (
          <Button
            onClick={stopRecording}
            variant="destructive"
            className="flex-1"
          >
            <Square className="w-4 h-4 mr-2" />
            {t('newEntry.voiceRecording.stopButton')}
          </Button>
        )}

        {isRecording && (
          <Button onClick={resetRecording} variant="outline" size="icon">
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-pulse"></div>
          {t('newEntry.voiceRecording.recordingIndicator')}
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center">
        {t('newEntry.voiceRecording.recognizesSpeech')}
      </div>
    </div>
  );
}
