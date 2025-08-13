import { createClient } from '@/shared/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import { safeSentry } from '@/shared/lib/sentry';
import { ServiceFactory } from '@/shared/lib/api/utils/service-factory';

export async function getServerUser(): Promise<{
  user: User | null;
  isSubscribed: boolean;
}> {
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
          span.setAttribute('error.type', 'get_user_failed');
          return { user: null, isSubscribed: false };
        }

        span.setAttribute('auth.user_present', !!user);
        if (user) {
          span.setAttribute('auth.user_id', user.id);
          span.setAttribute('auth.user_email', user.email || '');

          try {
            const subscriptionsService =
              ServiceFactory.createSubscriptionsService(supabase);
            const subscriptions =
              await subscriptionsService.getUserSubscriptions(user.id, {
                span,
                operation: 'get_user_subscriptions_for_auth',
              });

            const isSubscribed = subscriptions.length > 0;
            span.setAttribute('auth.has_subscription', isSubscribed);
            span.setAttribute('auth.subscriptions_count', subscriptions.length);

            if (isSubscribed) {
              span.setAttribute(
                'auth.subscription_ids',
                subscriptions.map(s => s.id).join(',')
              );
            }

            return { user, isSubscribed };
          } catch (subscriptionError) {
            safeSentry.captureException(subscriptionError as Error, {
              tags: { operation: 'get_user_subscriptions_for_auth' },
            });
            span.setAttribute('subscription_check_error', true);
            span.setAttribute('error.type', 'subscription_check_failed');
            return { user, isSubscribed: false };
          }
        }

        return { user: null, isSubscribed: false };
      } catch (error) {
        safeSentry.captureException(error as Error, {
          tags: { operation: 'get_server_user' },
        });
        span.setAttribute('error', true);
        span.setAttribute('error.type', 'server_auth_error');
        return { user: null, isSubscribed: false };
      }
    }
  );
}
