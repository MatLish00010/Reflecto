'use client'

import { useState } from 'react'
import { EnhancedVoiceRecorder } from './enhanced-voice-recorder'

interface AudioInputTabsProps {
  onAudioProcessed: (text: string) => void
  disabled?: boolean
  translations: {
    voiceRecording: {
      startButton: string
      stopButton: string
      recordingIndicator: string
      processingText: string
      errorMessage: string
    }
  }
}

export function AudioInputTabs({ 
  onAudioProcessed, 
  disabled = false,
  translations
}: AudioInputTabsProps) {
  const [isRecording, setIsRecording] = useState(false)

  const handleRecordingComplete = (text: string) => {
    onAudioProcessed(text)
  }

  return (
    <div className="space-y-4">
      <EnhancedVoiceRecorder
        onRecordingComplete={handleRecordingComplete}
        isRecording={isRecording}
        onRecordingChange={setIsRecording}
        disabled={disabled}
        translations={translations.voiceRecording}
      />
    </div>
  )
} 