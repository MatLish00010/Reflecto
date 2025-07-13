import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookie
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = await createClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', parseInt(userId))
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in user/me API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
