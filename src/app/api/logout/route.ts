import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ success: true });

    // Clear cookie on server side
    response.cookies.set('userId', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error in logout API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
