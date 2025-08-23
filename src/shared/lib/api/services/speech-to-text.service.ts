import type { Span } from '@sentry/types';
import OpenAI from 'openai';
import { safeSentry } from '@/shared/lib/sentry';

export interface SpeechToTextServiceOptions {
  span?: Span;
  operation?: string;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  promptUsed?: boolean;
}

export interface TranscribeAudioParams {
  audioFile: File;
  prompt?: string;
  options?: SpeechToTextServiceOptions;
}

export class SpeechToTextService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio({
    audioFile,
    prompt,
    options = {},
  }: TranscribeAudioParams): Promise<TranscriptionResult> {
    const { span, operation = 'transcribe_audio' } = options;

    if (!process.env.OPENAI_API_KEY) {
      const error = new Error('OpenAI API key is not configured');
      safeSentry.captureException(error, {
        tags: { operation },
      });
      throw error;
    }

    span?.setAttribute('audio.file.size', audioFile.size);
    span?.setAttribute('audio.file.type', audioFile.type);
    span?.setAttribute('prompt.provided', !!prompt);
    if (prompt) {
      span?.setAttribute('prompt.length', prompt.length);
    }

    try {
      const transcription = await this.openai.audio.transcriptions.create({
        model: prompt ? 'gpt-4o-transcribe' : 'whisper-1',
        file: audioFile,
        response_format: 'text',
        prompt: prompt || undefined,
      });

      span?.setAttribute('transcription.length', transcription.length);
      span?.setAttribute('success', true);

      return {
        text: transcription,
        confidence: 1.0,
        promptUsed: !!prompt,
      };
    } catch (openaiApiError: unknown) {
      const errorData = openaiApiError as {
        code?: string;
        status?: number;
      };

      // Handle specific OpenAI errors
      if (errorData.code === 'insufficient_quota') {
        const error = new Error('OpenAI quota exceeded');
        safeSentry.captureException(error, {
          tags: { operation, error_type: 'quota_exceeded' },
          extra: { audioSize: audioFile.size },
        });
        span?.setAttribute('error.type', 'quota_exceeded');
        throw error;
      }

      // Handle HTTP status errors
      switch (errorData.status) {
        case 400: {
          const badRequestError = new Error(
            prompt
              ? 'Unsupported audio file format or invalid prompt'
              : 'Unsupported audio file format'
          );
          safeSentry.captureException(badRequestError, {
            tags: { operation, error_type: 'bad_request' },
            extra: { audioSize: audioFile.size },
          });
          span?.setAttribute('error.type', 'bad_request');
          throw badRequestError;
        }

        case 401: {
          const unauthorizedError = new Error('Invalid OpenAI API key');
          safeSentry.captureException(unauthorizedError, {
            tags: { operation, error_type: 'unauthorized' },
          });
          span?.setAttribute('error.type', 'unauthorized');
          throw unauthorizedError;
        }

        case 413: {
          const fileTooLargeError = new Error('File too large (maximum 25MB)');
          safeSentry.captureException(fileTooLargeError, {
            tags: { operation, error_type: 'file_too_large' },
            extra: { audioSize: audioFile.size },
          });
          span?.setAttribute('error.type', 'file_too_large');
          throw fileTooLargeError;
        }

        case 429: {
          const rateLimitError = new Error('OpenAI rate limit exceeded');
          safeSentry.captureException(rateLimitError, {
            tags: { operation, error_type: 'rate_limited' },
            extra: { audioSize: audioFile.size },
          });
          span?.setAttribute('error.type', 'rate_limited');
          throw rateLimitError;
        }

        default: {
          const openaiError = new Error(
            'Error processing audio through OpenAI'
          );
          safeSentry.captureException(openaiError, {
            tags: { operation, error_type: 'openai_error' },
            extra: { audioSize: audioFile.size },
          });
          span?.setAttribute('error.type', 'openai_error');
          throw openaiError;
        }
      }
    }
  }
}
