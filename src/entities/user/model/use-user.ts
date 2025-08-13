import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/shared/lib/client';
import type { User } from '@supabase/supabase-js';
import { safeSentry } from '@/shared/lib/sentry';
import { useUserContext } from '@/shared/contexts/user-context';
import { subscriptionsClientService } from '@/shared/lib/api/services/subscriptions.service';

export const userKeys = {
  all: ['user'] as const,
  subscription: (userId: string) => ['user', userId, 'subscription'] as const,
};

export function useUser() {
  const { user: initialUser, isSubscribed: initialIsSubscribed } =
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

  const { data: isSubscribed = initialIsSubscribed, ...subscriptionQuery } =
    useQuery({
      queryKey: userKeys.subscription(user?.id || ''),
      queryFn: async (): Promise<boolean> => {
        if (!user) return false;
        return subscriptionsClientService.checkUserSubscription();
      },
      enabled: !!user,
      initialData: initialIsSubscribed,
      retry: false,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: true,
    });
  return {
    user: user || null,
    isAuthenticated: !!user,
    isSubscribed,
    ...userQuery,
    subscriptionQuery,
  };
}
