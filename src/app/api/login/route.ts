import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Invitation code is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*, users(*)')
      .eq('code', code)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid invitation code' },
        { status: 400 }
      );
    }

    if (!invite.user_id) {
      return NextResponse.json(
        { error: 'Invitation code is not associated with any user' },
        { status: 400 }
      );
    }

    const user = invite.users;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!invite.used_at) {
      const { error: markUsedError } = await supabase
        .from('invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id);

      if (markUsedError) {
        console.error('Error updating used_at for invite:', markUsedError);
      }
    }

    const response = NextResponse.json({ user });

    response.cookies.set('userId', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error in login API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
