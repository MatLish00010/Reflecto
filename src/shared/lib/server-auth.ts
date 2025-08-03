import { createClient } from '@/shared/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import { safeSentry } from '@/shared/lib/sentry';

export async function getServerUser(): Promise<User | null> {
  return safeSentry.startSpanAsync(
    {
      op: 'auth.server',
      name: 'getServerUser',
    },
    async span => {
      try {
        const supabase = await createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          safeSentry.captureException(error, {
            tags: { operation: 'get_server_user' },
          });
          span.setAttribute('error', true);
          console.error('Error getting user:', error);
          return null;
        }

        span.setAttribute('auth.user_present', !!user);
        if (user) {
          span.setAttribute('auth.user_id', user.id);
          span.setAttribute('auth.user_email', user.email || '');
        }

        return user;
      } catch (error) {
        safeSentry.captureException(error as Error, {
          tags: { operation: 'get_server_user' },
        });
        span.setAttribute('error', true);
        console.error('Server auth error:', error);
        return null;
      }
    }
  );
}
