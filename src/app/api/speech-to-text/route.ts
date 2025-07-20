import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireAuth } from '@/shared/lib/auth';
import { safeSentry } from '@/shared/lib/sentry';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'POST /api/speech-to-text',
    },
    async span => {
      try {
        const authResult = await requireAuth();
        if (!authResult.isAuthenticated) {
          span.setAttribute('auth.status', 'unauthenticated');
          return authResult.response;
        }

        span.setAttribute('user.id', authResult.user!.id);

        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
          const error = new Error('Audio file not found');
          safeSentry.captureException(error, {
            tags: { operation: 'speech_to_text' },
            extra: { userId: authResult.user!.id },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Audio file not found' },
            { status: 400 }
          );
        }

        span.setAttribute('audio.file.size', audioFile.size);
        span.setAttribute('audio.file.type', audioFile.type);

        if (!process.env.OPENAI_API_KEY) {
          const error = new Error('OpenAI API key is not configured');
          safeSentry.captureException(error, {
            tags: { operation: 'speech_to_text' },
            extra: { userId: authResult.user!.id },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'OpenAI API key is not configured' },
            { status: 500 }
          );
        }

        try {
          const transcription = await openai.audio.transcriptions.create({
            model: process.env.OPENAI_TRANSCRIPTION_MODEL || 'whisper-1',
            file: audioFile,
            response_format: 'text',
          });

          span.setAttribute('transcription.length', transcription.length);
          span.setAttribute('success', true);

          return NextResponse.json({
            text: transcription,
            confidence: 1.0,
          });
        } catch (openaiApiError: unknown) {
          const errorData = openaiApiError as {
            code?: string;
            status?: number;
          };

          if (errorData.code === 'insufficient_quota') {
            const error = new Error('OpenAI quota exceeded');
            safeSentry.captureException(error, {
              tags: {
                operation: 'speech_to_text',
                error_type: 'quota_exceeded',
              },
              extra: { userId: authResult.user!.id, audioSize: audioFile.size },
            });
            span.setAttribute('error', true);
            span.setAttribute('error.type', 'quota_exceeded');
            return NextResponse.json(
              {
                error:
                  'OpenAI quota exceeded. Please try again later or upgrade your plan.',
              },
              { status: 429 }
            );
          }

          switch (errorData.status) {
            case 400:
              const badRequestError = new Error(
                'Unsupported audio file format'
              );
              safeSentry.captureException(badRequestError, {
                tags: {
                  operation: 'speech_to_text',
                  error_type: 'bad_request',
                },
                extra: {
                  userId: authResult.user!.id,
                  audioSize: audioFile.size,
                },
              });
              span.setAttribute('error', true);
              span.setAttribute('error.type', 'bad_request');
              return NextResponse.json(
                { error: 'Unsupported audio file format' },
                { status: errorData.status }
              );
            case 401:
              const unauthorizedError = new Error('Invalid OpenAI API key');
              safeSentry.captureException(unauthorizedError, {
                tags: {
                  operation: 'speech_to_text',
                  error_type: 'unauthorized',
                },
                extra: { userId: authResult.user!.id },
              });
              span.setAttribute('error', true);
              span.setAttribute('error.type', 'unauthorized');
              return NextResponse.json(
                { error: 'Invalid OpenAI API key' },
                { status: errorData.status }
              );
            case 413:
              const fileTooLargeError = new Error('File too large');
              safeSentry.captureException(fileTooLargeError, {
                tags: {
                  operation: 'speech_to_text',
                  error_type: 'file_too_large',
                },
                extra: {
                  userId: authResult.user!.id,
                  audioSize: audioFile.size,
                },
              });
              span.setAttribute('error', true);
              span.setAttribute('error.type', 'file_too_large');
              return NextResponse.json(
                { error: 'File too large (maximum 25MB)' },
                { status: errorData.status }
              );
            case 429:
              const rateLimitError = new Error('OpenAI rate limit exceeded');
              safeSentry.captureException(rateLimitError, {
                tags: {
                  operation: 'speech_to_text',
                  error_type: 'rate_limited',
                },
                extra: {
                  userId: authResult.user!.id,
                  audioSize: audioFile.size,
                },
              });
              span.setAttribute('error', true);
              span.setAttribute('error.type', 'rate_limited');
              return NextResponse.json(
                {
                  error:
                    'OpenAI quota exceeded. Please try again later or upgrade your plan.',
                },
                { status: errorData.status }
              );
          }

          const openaiError = new Error(
            'Error processing audio through OpenAI'
          );
          safeSentry.captureException(openaiError, {
            tags: { operation: 'speech_to_text', error_type: 'openai_error' },
            extra: { userId: authResult.user!.id, audioSize: audioFile.size },
          });
          span.setAttribute('error', true);
          span.setAttribute('error.type', 'openai_error');
          return NextResponse.json(
            { error: 'Error processing audio through OpenAI' },
            { status: 500 }
          );
        }
      } catch (error) {
        safeSentry.captureException(error as Error, {
          tags: { operation: 'speech_to_text' },
        });
        span.setAttribute('error', true);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    }
  );
}
