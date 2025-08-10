import { createBrowserClient } from '@/shared/lib/client';
import { safeSentry } from '@/shared/lib/sentry';

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

        // Try to refresh the session to ensure it's up to date
        const { data, error } = await supabase.auth.refreshSession();

        if (error) {
          safeSentry.captureException(error, {
            tags: { operation: 'sync_auth_session' },
          });
          span.setAttribute('error', true);
          console.warn('Failed to refresh session:', error.message);
        } else if (data.session) {
          span.setAttribute('auth.session_refreshed', true);
          span.setAttribute('auth.user_present', !!data.session.user);
          if (data.session.user) {
            span.setAttribute('auth.user_id', data.session.user.id);
          }
          console.log('Session refreshed successfully');
        } else {
          span.setAttribute('auth.no_session', true);
        }
      } catch (error) {
        safeSentry.captureException(error as Error, {
          tags: { operation: 'sync_auth_session' },
        });
        span.setAttribute('error', true);
        console.warn('Session sync error:', error);
      }
    }
  );
}
