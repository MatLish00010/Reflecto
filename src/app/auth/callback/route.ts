import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/shared/lib/supabase/server';
import { safeSentry } from '@/shared/lib/sentry';

export async function GET(request: NextRequest) {
  return safeSentry.startSpanAsync(
    {
      op: 'http.server',
      name: 'GET /auth/callback',
    },
    async span => {
      try {
        const { searchParams, origin } = new URL(request.url);
        const code = searchParams.get('code');
        const next = searchParams.get('next') ?? '/';

        span.setAttribute('auth.provider', 'google');
        span.setAttribute('auth.has_code', !!code);
        span.setAttribute('auth.redirect_to', next);

        if (code) {
          const supabase = await createClient();
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            safeSentry.captureException(error, {
              tags: { operation: 'oauth_callback' },
              extra: { provider: 'google' },
            });
            span.setAttribute('error', true);
            return NextResponse.redirect(
              `${origin}/?error=auth_callback_failed`
            );
          }

          span.setAttribute('auth.success', true);
          return NextResponse.redirect(`${origin}${next}`);
        }

        // If no code, redirect to home with error
        span.setAttribute('error', true);
        return NextResponse.redirect(`${origin}/?error=no_auth_code`);
      } catch (error) {
        safeSentry.captureException(error as Error, {
          tags: { operation: 'oauth_callback' },
          extra: { provider: 'google' },
        });
        span.setAttribute('error', true);
        return NextResponse.redirect(`${origin}/?error=auth_callback_error`);
      }
    }
  );
}
