import { NextRequest } from 'next/server';
import {
  handleApiRequest,
  validateRequiredFields,
  ServiceFactory,
} from '@/shared/lib/api';

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    { operation: 'speech_to_text' },
    async (context, request: NextRequest) => {
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;

      const validation = validateRequiredFields({ audioFile }, ['audioFile']);
      if (!validation.isValid) {
        throw new Error('Audio file not found');
      }

      context.span.setAttribute('audio.file.size', audioFile.size);
      context.span.setAttribute('audio.file.type', audioFile.type);

      const speechToTextService = ServiceFactory.createSpeechToTextService();
      const result = await speechToTextService.transcribeAudio({
        audioFile,
        options: { span: context.span, operation: 'transcribe_audio' },
      });

      return result;
    }
  );
}
