'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Square, RotateCcw } from 'lucide-react'
import { useAlertContext } from '@/components/alert-provider'

interface VoiceRecorderProps {
  onRecordingComplete: (text: string) => void
  isRecording: boolean
  onRecordingChange: (recording: boolean) => void
  disabled?: boolean
  translations: {
    startButton: string
    stopButton: string
    recordingIndicator: string
    processingText: string
    errorMessage: string
  }
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  isRecording, 
  onRecordingChange,
  disabled = false,
  translations
}: VoiceRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { showError } = useAlertContext()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        
        try {
          const formData = new FormData()
          formData.append('audio', audioBlob)
          
          const response = await fetch('/api/speech-to-text', { 
            method: 'POST', 
            body: formData 
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Error processing audio')
          }
          
          const { text } = await response.json()
          onRecordingComplete(text)
        } catch (error) {
          console.error('Error processing audio:', error)
          const errorMessage = error instanceof Error ? error.message : translations.errorMessage
          showError(errorMessage)
          onRecordingComplete('')
        } finally {
          setIsProcessing(false)
        }

        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      onRecordingChange(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      onRecordingChange(false)
    }
  }

  const resetRecording = () => {
    audioChunksRef.current = []
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null
    }
  }

  if (isProcessing) {
    return (
      <Button variant="outline" disabled className="w-full">
        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
        {translations.processingText}
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {!isRecording ? (
          <Button 
            onClick={startRecording} 
            disabled={disabled}
            variant="outline" 
            className="flex-1"
          >
            <Mic className="w-4 h-4 mr-2" />
            {translations.startButton}
          </Button>
        ) : (
                  <Button 
          onClick={stopRecording} 
          variant="destructive" 
          className="flex-1"
        >
          <Square className="w-4 h-4 mr-2" />
          {translations.stopButton}
        </Button>
        )}
        
        {isRecording && (
          <Button 
            onClick={resetRecording} 
            variant="outline" 
            size="icon"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      {isRecording && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full animate-pulse"></div>
          {translations.recordingIndicator}
        </div>
      )}
    </div>
  )
} 