import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    return NextResponse.json({ user: authResult.user });
  } catch (error) {
    console.error('Error in user/me API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
