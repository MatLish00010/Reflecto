import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/shared/lib/server';
import { getCurrentDateUTC } from '@/shared/lib/date-utils';
import { requireAuth } from '@/shared/lib/auth';
import { safeSentry } from '@/shared/lib/sentry';
import { encryptField, decryptField } from '@/shared/lib/crypto-field';

export async function GET(request: NextRequest) {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'GET /api/notes',
    },
    async span => {
      try {
        const authResult = await requireAuth();

        if (!authResult.isAuthenticated) {
          span.setAttribute('auth.status', 'unauthenticated');
          return authResult.response;
        }

        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        const userId = authResult.user!.id;
        span.setAttribute('user.id', userId);
        span.setAttribute('filters.from', from || '');
        span.setAttribute('filters.to', to || '');

        const supabase = await createServerClient();

        let query = supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (from) {
          query = query.gte('created_at', from);
        }
        if (to) {
          query = query.lte('created_at', to);
        }

        const { data: notes, error } = await query;

        if (error) {
          safeSentry.captureException(error as Error, {
            tags: { operation: 'fetch_notes' },
            extra: { userId, from, to },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Failed to fetch notes' },
            { status: 500 }
          );
        }

        const decryptedNotes = (notes || []).map(noteObj => {
          if (!noteObj.note) return noteObj;
          const { value, error } = decryptField<string>({
            encrypted: noteObj.note,
            span,
            operation: 'decrypt_note',
          });
          if (error) throw error; // Will be caught by outer catch
          return { ...noteObj, note: value };
        });

        span.setAttribute('notes.count', decryptedNotes.length);
        return NextResponse.json({ notes: decryptedNotes });
      } catch (error) {
        console.error('Error in notes GET API:', error);
        safeSentry.captureException(error as Error, {
          tags: { operation: 'fetch_notes' },
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

export async function POST(request: NextRequest) {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'POST /api/notes',
    },
    async span => {
      try {
        const authResult = await requireAuth();
        if (!authResult.isAuthenticated) {
          span.setAttribute('auth.status', 'unauthenticated');
          return authResult.response;
        }

        const { note } = await request.json();

        if (!note) {
          const error = new Error('Note content is required');
          safeSentry.captureException(error, {
            tags: { operation: 'create_note' },
            extra: { userId: authResult.user?.id },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Note content is required' },
            { status: 400 }
          );
        }

        const userId = authResult.user!.id;
        span.setAttribute('user.id', userId);
        span.setAttribute('note.length', note.length);

        const supabase = await createServerClient();

        const { value: encryptedNote, error: encryptError } = encryptField({
          data: note,
          span,
          operation: 'encrypt_note',
        });
        if (encryptError) return encryptError;

        const { data: newNote, error: insertError } = await supabase
          .from('notes')
          .insert([
            {
              note: encryptedNote,
              user_id: userId,
              created_at: getCurrentDateUTC(),
            },
          ])
          .select()
          .single();

        if (insertError) {
          safeSentry.captureException(insertError as Error, {
            tags: { operation: 'create_note' },
            extra: { userId, noteLength: note.length },
          });
          span.setAttribute('error', true);
          return NextResponse.json(
            { error: 'Failed to create note' },
            { status: 500 }
          );
        }

        span.setAttribute('note.id', newNote.id);
        return NextResponse.json({ note: newNote });
      } catch (error) {
        console.error('Error in notes API:', error);
        safeSentry.captureException(error as Error, {
          tags: { operation: 'create_note' },
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
