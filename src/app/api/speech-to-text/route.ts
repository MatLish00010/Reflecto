import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireAuth } from '@/shared/lib/auth';
import * as Sentry from '@sentry/nextjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      const error = new Error('Audio file not found');
      Sentry.captureException(error);
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      const error = new Error('OpenAI API key is not configured');
      Sentry.captureException(error);
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

      return NextResponse.json({
        text: transcription,
        confidence: 1.0,
      });
    } catch (openaiError: unknown) {
      const error = openaiError as { code?: string; status?: number };

      if (error.code === 'insufficient_quota') {
        Sentry.captureException(error);
        return NextResponse.json(
          {
            error:
              'OpenAI quota exceeded. Please try again later or upgrade your plan.',
          },
          { status: 429 }
        );
      }

      switch (error.status) {
        case 400:
          Sentry.captureException(error);
          return NextResponse.json(
            { error: 'Unsupported audio file format' },
            { status: error.status }
          );
        case 401:
          Sentry.captureException(error);
          return NextResponse.json(
            { error: 'Invalid OpenAI API key' },
            { status: error.status }
          );
        case 413:
          Sentry.captureException(error);
          return NextResponse.json(
            { error: 'File too large (maximum 25MB)' },
            { status: error.status }
          );
        case 429:
          Sentry.captureException(error);
          return NextResponse.json(
            {
              error:
                'OpenAI quota exceeded. Please try again later or upgrade your plan.',
            },
            { status: error.status }
          );
      }

      Sentry.captureException(error);
      return NextResponse.json(
        { error: 'Error processing audio through OpenAI' },
        { status: 500 }
      );
    }
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
