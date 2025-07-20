import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/shared/lib/server';
import { getCurrentDateUTC } from '@/shared/lib/date-utils';
import { requireAuth } from '@/shared/lib/auth';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();

    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const userId = authResult.user!.id;

    const supabase = await await createServerClient();

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
      Sentry.captureException(error);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error in notes GET API:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    const { note } = await request.json();

    if (!note) {
      const error = new Error('Note content is required');
      Sentry.captureException(error);
      return NextResponse.json(
        { error: 'Note content is required' },
        { status: 400 }
      );
    }

    const supabase = await await createServerClient();

    const { data: newNote, error: insertError } = await supabase
      .from('notes')
      .insert([
        {
          note,
          user_id: authResult.user!.id,
          created_at: getCurrentDateUTC(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      Sentry.captureException(insertError);
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      );
    }

    return NextResponse.json({ note: newNote });
  } catch (error) {
    console.error('Error in notes API:', error);
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
