import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', parseInt(userId))
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error in notes GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { note, userId } = await request.json();

    if (!note || !userId) {
      return NextResponse.json(
        { error: 'Note content and user ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Always create a new note
    const { data: newNote, error: insertError } = await supabase
      .from('notes')
      .insert([
        {
          note,
          user_id: userId,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      );
    }

    return NextResponse.json({ note: newNote });
  } catch (error) {
    console.error('Error in notes API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
