'use client';

import { useEffect, useRef, useState } from 'react';
import { useUser } from '@/entities';
import { useAuthModalContext } from '@/shared/client/contexts/auth-modal-context';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { Clock, Mic, RotateCcw, Square } from '@/shared/client/icons';
import { useAlertContext } from '@/shared/client/providers/alert-provider';
import { Button } from '@/shared/client/ui/button';
import { API_CONFIG } from '@/shared/common/config';
import { safeSentry } from '@/shared/common/lib/sentry';

interface EnhancedVoiceRecorderProps {
  onRecordingComplete: (text: string) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  disabled?: boolean;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function EnhancedVoiceRecorder({
  onRecordingComplete,
  isRecording,
  onRecordingChange,
  disabled = false,
}: EnhancedVoiceRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isResetRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { showError } = useAlertContext();
  const { t } = useTranslation();
  const { isAuthenticated } = useUser();
  const { openModal } = useAuthModalContext();

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    if (!isAuthenticated) {
      openModal();
      return;
    }

    return safeSentry.startSpanAsync(
      {
        op: 'ui.click',
        name: 'Start Enhanced Voice Recording',
      },
      async span => {
        try {
          span.setAttribute('component', 'EnhancedVoiceRecorder');
          span.setAttribute('action', 'startRecording');

          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            if (isResetRef.current) {
              isResetRef.current = false;
              stream.getTracks().forEach(track => {
                track.stop();
              });
              return;
            }

            setIsProcessing(true);
            const audioBlob = new Blob(audioChunksRef.current, {
              type: 'audio/wav',
            });

            try {
              const formData = new FormData();
              formData.append('audio', audioBlob);

              const response = await fetch(
                API_CONFIG.ENDPOINTS.SPEECH_TO_TEXT,
                {
                  method: 'POST',
                  body: formData,
                }
              );

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                  errorData.error || t('newEntry.voiceRecording.errorMessage')
                );
              }

              const { text } = await response.json();
              onRecordingComplete(text);
            } catch (error) {
              safeSentry.captureException(error as Error, {
                tags: {
                  component: 'EnhancedVoiceRecorder',
                  action: 'processAudio',
                },
                extra: {
                  audioSize: audioBlob.size,
                },
              });

              const { logger } = safeSentry;
              logger.error('Error processing audio', {
                component: 'EnhancedVoiceRecorder',
                audioSize: audioBlob.size,
                error: error instanceof Error ? error.message : 'Unknown error',
              });

              const errorMessage =
                error instanceof Error
                  ? error.message
                  : t('newEntry.voiceRecording.errorMessage');
              showError(errorMessage);
              onRecordingComplete('');
            } finally {
              setIsProcessing(false);
            }

            stream.getTracks().forEach(track => {
              track.stop();
            });
          };

          mediaRecorder.start();
          onRecordingChange(true);
        } catch (error) {
          safeSentry.captureException(error as Error, {
            tags: {
              component: 'EnhancedVoiceRecorder',
              action: 'accessMicrophone',
            },
            extra: {
              userAgent: navigator.userAgent,
            },
          });

          const { logger } = safeSentry;
          logger.error('Error accessing microphone', {
            component: 'EnhancedVoiceRecorder',
            userAgent: navigator.userAgent,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          const errorMessage =
            error instanceof Error
              ? error.message
              : t('newEntry.voiceRecording.errorAccessingMicrophone');
          showError(errorMessage);
        }
      }
    );
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
    <div className="space-y-3.5">
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
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-pulse"></div>
            {t('newEntry.voiceRecording.recordingIndicator')}
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{formatTime(recordingTime)}</span>
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              {t('newEntry.voiceRecording.recommendedDuration')}
            </div>
          </div>
        </div>
      )}

      <div className="text-[10px] text-muted-foreground text-center">
        {t('newEntry.voiceRecording.recognizesSpeech')}
      </div>
    </div>
  );
}
