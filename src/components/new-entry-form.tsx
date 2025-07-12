"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AudioInputTabs } from "@/components/audio-input-tabs";

interface NewEntryFormProps {
  contentLabel: string;
  contentPlaceholder: string;
  saveButton: string;
  voiceRecording: {
    startButton: string;
    stopButton: string;
    recordingIndicator: string;
    processingText: string;
    errorMessage: string;
  };
}

export function NewEntryForm({
  contentLabel,
  contentPlaceholder,
  saveButton,
  voiceRecording,
}: NewEntryFormProps) {
  const [content, setContent] = useState("");

  const handleRecordingComplete = (text: string) => {
    setContent((prev) => prev + (prev ? "\n" : "") + text);
  };

  const handleSave = () => {
    console.log("Saving entry:", { content });
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          {contentLabel}
        </label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={contentPlaceholder}
          className="min-h-[200px]"
        />
        <div className="mt-2">
          <AudioInputTabs
            onAudioProcessed={handleRecordingComplete}
            translations={{
              voiceRecording,
            }}
          />
        </div>
      </div>
      <Button
        onClick={handleSave}
        className="w-full"
        disabled={!content.trim()}
      >
        {saveButton}
      </Button>
    </div>
  );
}
