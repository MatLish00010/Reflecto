import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { note } = await request.json();
    const { id } = await params;
    const noteId = parseInt(id);

    if (!note || isNaN(noteId)) {
      return NextResponse.json(
        { error: 'Note content and valid note ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: updatedNote, error } = await supabase
      .from('notes')
      .update({ note })
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update note' },
        { status: 500 }
      );
    }

    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    console.error('Error in notes update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const noteId = parseInt(id);

    if (isNaN(noteId)) {
      return NextResponse.json(
        { error: 'Valid note ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.from('notes').delete().eq('id', noteId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete note' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in notes delete API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
