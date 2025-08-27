import type { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { useUserContext } from '@/shared/client/contexts/user-context';
import { subscriptionsClientService } from '@/shared/client/lib/api/subscriptions-client.service';
import { createBrowserClient } from '@/shared/client/lib/client';
import { safeSentry } from '@/shared/common/lib/sentry';
import type { UserSubscription } from '@/shared/common/types/subscriptions';
import { userKeys } from './user-keys';

export function useUser() {
  const { user: initialUser, subscription: initialSubscription } =
    useUserContext();

  const { data: user, ...userQuery } = useQuery({
    queryKey: userKeys.all,
    queryFn: async (): Promise<User | null> => {
      const supabase = createBrowserClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        safeSentry.captureException(error, {
          tags: { operation: 'get_user' },
        });
        return null;
      }

      return user;
    },
    initialData: initialUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const { data: subscription = initialSubscription } = useQuery({
    queryKey: userKeys.subscription(user?.id || ''),
    queryFn: async (): Promise<UserSubscription | null> => {
      if (!user) {
        return null;
      }

      const response = await subscriptionsClientService.getUserSubscriptions();

      const subscription = response.subscriptions?.[0];

      return {
        isActive: true,
        stripeCustomerId: subscription.stripe_customer_id,
        stripeSubscriptionId: subscription.stripe_subscription_id,
      };
    },
    enabled: !!user,
    initialData: initialSubscription,
    retry: false,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  return {
    user: user || null,
    isAuthenticated: !!user,
    subscription,
    ...userQuery,
  };
}
