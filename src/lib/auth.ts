import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export async function authenticateUser(): Promise<{
  isAuthenticated: boolean;
  user?: User;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return {
        isAuthenticated: false,
        error: error.message,
      };
    }

    if (!user) {
      return {
        isAuthenticated: false,
        error: 'User not authenticated',
      };
    }

    return {
      isAuthenticated: true,
      user,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication failed',
    };
  }
}

export async function requireAuth(): Promise<{
  isAuthenticated: boolean;
  user?: User;
  response?: NextResponse;
}> {
  const authResult = await authenticateUser();

  if (!authResult.isAuthenticated) {
    return {
      isAuthenticated: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return {
    isAuthenticated: true,
    user: authResult.user,
  };
}
