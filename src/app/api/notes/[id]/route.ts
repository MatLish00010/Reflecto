import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/shared/lib/server';
import { requireAuth } from '@/shared/lib/auth';
import { safeSentry } from '@/shared/lib/sentry';
import { encryptField } from '@/shared/lib/crypto-field';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'PUT /api/notes/[id]',
    },
    async span => {
      try {
        const authResult = await requireAuth();
        if (!authResult.isAuthenticated) {
          span.setAttribute('auth.status', 'unauthenticated');
          return authResult.response;
        }

        const { note } = await request.json();
        const { id } = await params;
        const noteId = parseInt(id);

        span.setAttribute('user.id', authResult.user!.id);
        span.setAttribute('note.id', noteId);
        span.setAttribute('note.length', note?.length || 0);

        if (!note || isNaN(noteId)) {
          const error = new Error(
            'Note content and valid note ID are required'
          );
          safeSentry.captureException(error, {
            tags: { operation: 'update_note' },
            extra: { noteId, noteLength: note?.length },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Note content and valid note ID are required' },
            { status: 400 }
          );
        }

        const supabase = await createServerClient();

        const { data: existingNote, error: checkError } = await supabase
          .from('notes')
          .select('id, user_id')
          .eq('id', noteId)
          .eq('user_id', authResult.user!.id)
          .single();

        if (checkError || !existingNote) {
          safeSentry.captureException(
            checkError || new Error('Note not found or access denied'),
            {
              tags: { operation: 'update_note' },
              extra: { noteId, userId: authResult.user!.id },
            }
          );
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Note not found or access denied' },
            { status: 404 }
          );
        }

        const { value: encryptedNote, error: encryptError } = encryptField({
          data: note,
          span,
          operation: 'encrypt_note',
        });
        if (encryptError) return encryptError;

        const { data: updatedNote, error } = await supabase
          .from('notes')
          .update({ note: encryptedNote })
          .eq('id', noteId)
          .eq('user_id', authResult.user!.id)
          .select()
          .single();

        if (error) {
          safeSentry.captureException(error, {
            tags: { operation: 'update_note' },
            extra: { noteId, userId: authResult.user!.id },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Failed to update note' },
            { status: 500 }
          );
        }

        span.setAttribute('success', true);
        return NextResponse.json({ note: updatedNote });
      } catch (error) {
        console.error('Error in notes update API:', error);
        safeSentry.captureException(error as Error, {
          tags: { operation: 'update_note' },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'DELETE /api/notes/[id]',
    },
    async span => {
      try {
        const authResult = await requireAuth();
        if (!authResult.isAuthenticated) {
          span.setAttribute('auth.status', 'unauthenticated');
          return authResult.response;
        }

        const { id } = await params;
        const noteId = parseInt(id);

        span.setAttribute('user.id', authResult.user!.id);
        span.setAttribute('note.id', noteId);

        if (isNaN(noteId)) {
          const error = new Error('Valid note ID is required');
          safeSentry.captureException(error, {
            tags: { operation: 'delete_note' },
            extra: { noteId },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Valid note ID is required' },
            { status: 400 }
          );
        }

        const supabase = await createServerClient();

        const { data: existingNote, error: checkError } = await supabase
          .from('notes')
          .select('id, user_id')
          .eq('id', noteId)
          .eq('user_id', authResult.user!.id)
          .single();

        if (checkError || !existingNote) {
          safeSentry.captureException(
            checkError || new Error('Note not found or access denied'),
            {
              tags: { operation: 'delete_note' },
              extra: { noteId, userId: authResult.user!.id },
            }
          );
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Note not found or access denied' },
            { status: 404 }
          );
        }

        const { error } = await supabase
          .from('notes')
          .delete()
          .eq('id', noteId)
          .eq('user_id', authResult.user!.id);

        if (error) {
          safeSentry.captureException(error, {
            tags: { operation: 'delete_note' },
            extra: { noteId, userId: authResult.user!.id },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Failed to delete note' },
            { status: 500 }
          );
        }

        span.setAttribute('success', true);
        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Error in notes delete API:', error);
        safeSentry.captureException(error as Error, {
          tags: { operation: 'delete_note' },
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
