import { createBrowserClient } from '@/shared/client/lib/client';
import { safeSentry } from '@/shared/common/lib/sentry';

/**
 * Synchronizes the auth session between server and client
 * This ensures that after OAuth callback, the client can access the session
 */
export async function syncAuthSession(): Promise<void> {
  return safeSentry.startSpanAsync(
    {
      op: 'auth.sync',
      name: 'syncAuthSession',
    },
    async span => {
      try {
        const supabase = createBrowserClient();

        // First check if we have an existing session before trying to refresh
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (!existingSession) {
          span.setAttribute('auth.no_session', true);
          return; // No session to refresh
        }

        // Try to refresh the session to ensure it's up to date
        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
          safeSentry.captureException(error, {
            tags: { operation: 'sync_auth_session' },
          });
          span.setAttribute('error', true);
          span.setAttribute('error.type', 'refresh_failed');
        } else if (data.session) {
          span.setAttribute('auth.session_refreshed', true);
          span.setAttribute('auth.user_present', !!data.session.user);
          if (data.session.user) {
            span.setAttribute('auth.user_id', data.session.user.id);
          }
        } else {
          span.setAttribute('auth.no_session', true);
        }
      } catch (error) {
        if (error instanceof Error) {
          safeSentry.captureException(error as Error, {
            tags: { operation: 'sync_auth_session' },
          });
        }
        span.setAttribute('error', true);
        span.setAttribute('error.type', 'unexpected_error');
      }
    }
  );
}
