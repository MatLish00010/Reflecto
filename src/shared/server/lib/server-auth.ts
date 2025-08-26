import type { User } from '@supabase/supabase-js';
import { ServiceFactory } from '@/shared/common/lib/api/utils/service-factory';
import { safeSentry } from '@/shared/common/lib/sentry';
import type { UserSubscription } from '@/shared/common/types/subscriptions';
import { createClient } from '@/shared/server/lib/supabase/server';

export async function getServerUser(): Promise<{
  user: User | null;
  subscription: UserSubscription | null;
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
          return { user: null, isSubscribed: false, subscription: null };
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

            const subscription = subscriptions?.[0];

            return {
              user,
              subscription: {
                isActive: !!subscription,
                stripeCustomerId: subscription?.stripe_customer_id,
                stripeSubscriptionId: subscription?.stripe_subscription_id,
              },
            };
          } catch (subscriptionError) {
            safeSentry.captureException(subscriptionError as Error, {
              tags: { operation: 'get_user_subscriptions_for_auth' },
            });
            span.setAttribute('subscription_check_error', true);
            span.setAttribute('error.type', 'subscription_check_failed');
            return { user, isSubscribed: false, subscription: null };
          }
        }

        return { user: null, isSubscribed: false, subscription: null };
      } catch (error) {
        safeSentry.captureException(error as Error, {
          tags: { operation: 'get_server_user' },
        });
        span.setAttribute('error', true);
        span.setAttribute('error.type', 'server_auth_error');
        return { user: null, isSubscribed: false, subscription: null };
      }
    }
  );
}
