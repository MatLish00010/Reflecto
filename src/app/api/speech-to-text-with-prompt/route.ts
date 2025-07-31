import { NextRequest } from 'next/server';
import {
  handleApiRequest,
  withRateLimit,
  RATE_LIMIT_CONFIGS,
} from '@/shared/lib/api';
import { ServiceFactory } from '@/shared/lib/api';
import { validateRequiredFields } from '@/shared/lib/api';

export async function POST(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.upload)(handleApiRequest)(
    request,
    { operation: 'speech_to_text_with_prompt' },
    async (context, request: NextRequest) => {
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;
      const prompt = formData.get('prompt') as string;

      const validation = validateRequiredFields({ audioFile }, ['audioFile']);
      if (!validation.isValid) {
        throw new Error('Audio file not found');
      }

      context.span.setAttribute('audio.file.size', audioFile.size);
      context.span.setAttribute('audio.file.type', audioFile.type);
      context.span.setAttribute('prompt.provided', !!prompt);
      if (prompt) {
        context.span.setAttribute('prompt.length', prompt.length);
      }

      const speechToTextService = ServiceFactory.createSpeechToTextService();
      const result = await speechToTextService.transcribeAudio({
        audioFile,
        prompt,
        options: {
          span: context.span,
          operation: 'transcribe_audio_with_prompt',
        },
      });

      return result;
    }
  );
}
