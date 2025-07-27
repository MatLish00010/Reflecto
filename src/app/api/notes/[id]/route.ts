import { NextRequest } from 'next/server';
import {
  handleApiRequest,
  withValidation,
  VALIDATION_SCHEMAS,
  validateNumericId,
  ServiceFactory,
} from '@/shared/lib/api';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(
    request,
    { operation: 'update_note' },
    withValidation(VALIDATION_SCHEMAS.updateNote)(
      async (context, request: NextRequest, validatedData) => {
        const { id } = await params;
        const noteId = validateNumericId(id, 'note');

        context.span.setAttribute('note.id', noteId);
        context.span.setAttribute(
          'note.length',
          validatedData.note?.length || 0
        );

        const notesService = ServiceFactory.createNotesService(
          context.supabase
        );
        const updatedNote = await notesService.updateNote({
          noteId,
          note: validatedData.note,
          userId: context.user.id,
          options: { span: context.span, operation: 'update_note' },
        });

        return { note: updatedNote };
      }
    )
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApiRequest(
    request,
    { operation: 'delete_note' },
    async context => {
      const { id } = await params;
      const noteId = validateNumericId(id, 'note');

      context.span.setAttribute('note.id', noteId);

      const notesService = ServiceFactory.createNotesService(context.supabase);
      await notesService.deleteNote({
        noteId,
        userId: context.user.id,
        options: { span: context.span, operation: 'delete_note' },
      });

      return { success: true };
    }
  );
}
