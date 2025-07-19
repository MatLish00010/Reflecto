'use client';

import { useState } from 'react';
import { EnhancedVoiceRecorder } from './enhanced-voice-recorder';

interface AudioInputTabsProps {
  onAudioProcessed: (text: string) => void;
  disabled?: boolean;
}

export function AudioInputTabs({
  onAudioProcessed,
  disabled = false,
}: AudioInputTabsProps) {
  const [isRecording, setIsRecording] = useState(false);

  const handleRecordingComplete = (text: string) => {
    onAudioProcessed(text);
  };

  return (
    <div className="space-y-4">
      <EnhancedVoiceRecorder
        onRecordingComplete={handleRecordingComplete}
        isRecording={isRecording}
        onRecordingChange={setIsRecording}
        disabled={disabled}
      />
    </div>
  );
}
