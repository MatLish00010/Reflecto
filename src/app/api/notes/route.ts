import type { NextRequest } from 'next/server';
import {
  handleApiRequest,
  RATE_LIMIT_CONFIGS,
  VALIDATION_SCHEMAS,
  withRateLimit,
  withValidation,
} from '@/shared/lib/api';
import { NotesService } from '@/shared/lib/api/services/server';

export async function GET(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'fetch_notes' },
    async (context, request: NextRequest) => {
      const { searchParams } = new URL(request.url);
      const from = searchParams.get('from') || undefined;
      const to = searchParams.get('to') || undefined;

      context.span.setAttribute('filters.from', from || '');
      context.span.setAttribute('filters.to', to || '');

      const notesService = new NotesService(context.supabase);
      const notes = await notesService.fetchNotes({
        userId: context.user.id,
        from,
        to,
        options: { span: context.span, operation: 'fetch_notes' },
      });

      return { notes };
    }
  );
}

// Handler with validation
const createNoteHandler = withValidation(VALIDATION_SCHEMAS.createNote)(
  async (context, _request: NextRequest, validatedData) => {
    context.span.setAttribute('note.length', validatedData.note.length);

    const notesService = new NotesService(context.supabase);
    const newNote = await notesService.createNote({
      note: validatedData.note,
      userId: context.user.id,
      options: { span: context.span, operation: 'create_note' },
    });

    return { note: newNote };
  }
);

export async function POST(request: NextRequest) {
  return withRateLimit(RATE_LIMIT_CONFIGS.standard)(handleApiRequest)(
    request,
    { operation: 'create_note' },
    createNoteHandler
  );
}
