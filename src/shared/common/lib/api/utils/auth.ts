import type { NextRequest, NextResponse } from 'next/server';
import type { ApiContext, ApiHandlerOptions } from '@/shared/common/types';
import { requireAuth } from '@/shared/server/lib/auth';
import { createServerClient } from '@/shared/server/lib/server';

export async function withAuth(
  _request: NextRequest,
  options: ApiHandlerOptions
): Promise<{ context?: ApiContext; error?: NextResponse }> {
  const { requireAuthentication = true, span } = options;

  if (!requireAuthentication) {
    const supabase = await createServerClient();
    if (!span) {
      throw new Error('Span is required for API context');
    }
    return { context: { user: { id: 'anonymous' }, supabase, span } };
  }

  const authResult = await requireAuth();
  if (!authResult.isAuthenticated) {
    span?.setAttribute('auth.status', 'unauthenticated');
    return { error: authResult.response };
  }

  const supabase = await createServerClient();
  if (!authResult.user) {
    throw new Error('User is required for authenticated requests');
  }
  if (!span) {
    throw new Error('Span is required for API context');
  }

  const context: ApiContext = {
    user: authResult.user,
    supabase,
    span,
  };

  span?.setAttribute('user.id', context.user.id);
  return { context };
}
