import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/shared/lib/server';
import { requireAuth } from '@/shared/lib/auth';
import type { Span } from '@sentry/types';

export interface ApiHandlerOptions {
  requireAuthentication?: boolean;
  operation: string;
  span?: Span;
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export interface ApiContext {
  user: AuthenticatedUser;
  supabase: Awaited<ReturnType<typeof createServerClient>>;
  span: Span;
}

export async function withAuth(
  request: NextRequest,
  options: ApiHandlerOptions
): Promise<{ context?: ApiContext; error?: NextResponse }> {
  const { requireAuthentication = true, span } = options;

  if (!requireAuthentication) {
    const supabase = await createServerClient();
    return { context: { user: { id: 'anonymous' }, supabase, span: span! } };
  }

  const authResult = await requireAuth();
  if (!authResult.isAuthenticated) {
    span?.setAttribute('auth.status', 'unauthenticated');
    return { error: authResult.response };
  }

  const supabase = await createServerClient();
  const context: ApiContext = {
    user: authResult.user!,
    supabase,
    span: span!,
  };

  span?.setAttribute('user.id', context.user.id);
  return { context };
}
