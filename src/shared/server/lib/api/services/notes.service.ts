import type { Span } from '@sentry/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { decryptField, encryptField } from '@/shared/common/lib/crypto-field';
import { getCurrentDateUTC } from '@/shared/common/lib/date-utils';
import { safeSentry } from '@/shared/common/lib/sentry';
import type { Database } from '@/shared/common/types/supabase';

type SupabaseClientType = SupabaseClient<Database>;

export interface NotesServiceOptions {
  span?: Span;
  operation?: string;
}

export interface Note {
  id: number;
  note: string | null;
  user_id: string | null;
  created_at: string;
}

export interface CreateNoteParams {
  note: string;
  userId: string;
  options?: NotesServiceOptions;
}

export interface UpdateNoteParams {
  noteId: number;
  note: string;
  userId: string;
  options?: NotesServiceOptions;
}

export interface DeleteNoteParams {
  noteId: number;
  userId: string;
  options?: NotesServiceOptions;
}

export interface FetchNotesParams {
  userId: string;
  from?: string;
  to?: string;
  options?: NotesServiceOptions;
}

export class NotesService {
  constructor(private supabase: SupabaseClientType) {}

  async createNote({
    note,
    userId,
    options = {},
  }: CreateNoteParams): Promise<Note> {
    const { span, operation = 'create_note' } = options;

    const { value: encryptedNote, error: encryptError } = encryptField({
      data: note,
      span,
      operation: 'encrypt_note',
    });

    if (encryptError) {
      safeSentry.captureException(new Error('Failed to encrypt note'), {
        tags: { operation },
        extra: { userId },
      });
      throw encryptError;
    }

    const { data: newNote, error: insertError } = await this.supabase
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
      safeSentry.captureException(insertError, {
        tags: { operation },
        extra: { userId, noteLength: note.length },
      });
      throw insertError;
    }

    span?.setAttribute('note.id', newNote.id);
    return newNote;
  }

  async updateNote({
    noteId,
    note,
    userId,
    options = {},
  }: UpdateNoteParams): Promise<Note> {
    const { span, operation = 'update_note' } = options;

    // Check if note exists and user has access
    const { data: existingNote, error: checkError } = await this.supabase
      .from('notes')
      .select('id, user_id')
      .eq('id', noteId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingNote) {
      const error = new Error('Note not found or access denied');
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { noteId, userId },
      });
      throw error;
    }

    const { value: encryptedNote, error: encryptError } = encryptField({
      data: note,
      span,
      operation: 'encrypt_note',
    });

    if (encryptError) {
      safeSentry.captureException(new Error('Failed to encrypt note'), {
        tags: { operation },
        extra: { userId, noteId },
      });
      throw encryptError;
    }

    const { data: updatedNote, error } = await this.supabase
      .from('notes')
      .update({ note: encryptedNote })
      .eq('id', noteId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { noteId, userId },
      });
      throw error;
    }

    return updatedNote;
  }

  async deleteNote({
    noteId,
    userId,
    options = {},
  }: DeleteNoteParams): Promise<void> {
    const { operation = 'delete_note' } = options;

    // Check if note exists and user has access
    const { data: existingNote, error: checkError } = await this.supabase
      .from('notes')
      .select('id, user_id')
      .eq('id', noteId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingNote) {
      const error = new Error('Note not found or access denied');
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { noteId, userId },
      });
      throw error;
    }

    const { error } = await this.supabase
      .from('notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    if (error) {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { noteId, userId },
      });
      throw error;
    }
  }

  async fetchNotes({
    userId,
    from,
    to,
    options = {},
  }: FetchNotesParams): Promise<Note[]> {
    const { span, operation = 'fetch_notes' } = options;

    let query = this.supabase
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
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { userId, from, to },
      });
      throw error;
    }

    const decryptedNotes = (notes || []).map(noteObj => {
      if (!noteObj.note) {
        return noteObj;
      }
      const { value, error } = decryptField<string>({
        encrypted: noteObj.note,
        span,
        operation: 'decrypt_note',
      });
      if (error) {
        throw error;
      }
      return { ...noteObj, note: value || null };
    });

    span?.setAttribute('notes.count', decryptedNotes.length);
    return decryptedNotes;
  }
}
