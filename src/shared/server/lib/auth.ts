import type { User } from '@supabase/supabase-js';
import type { NextResponse } from 'next/server';
import { createErrorResponse } from '@/shared/common/lib/api/utils/response-helpers';
import { safeSentry } from '@/shared/common/lib/sentry';
import { createServerClient } from '@/shared/server/lib/server';

export async function authenticateUser(): Promise<{
  isAuthenticated: boolean;
  user?: User;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
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
    safeSentry.captureException(error as Error, {
      tags: { operation: 'authenticate_user' },
    });
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
      response: createErrorResponse('Unauthorized', 401),
    };
  }

  return {
    isAuthenticated: true,
    user: authResult.user,
  };
}
