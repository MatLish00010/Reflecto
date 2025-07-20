import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/shared/lib/client';
import type { User } from '@supabase/supabase-js';
import { safeSentry } from '@/shared/lib/sentry';

export const userKeys = {
  all: ['user'] as const,
};

export function useUser() {
  const { data, ...query } = useQuery({
    queryKey: userKeys.all,
    queryFn: async (): Promise<User | null> => {
      const supabase = createBrowserClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        if (error.message !== 'Auth session missing!') {
          safeSentry.captureException(error, {
            tags: { operation: 'get_user' },
          });
        }
        return null;
      }

      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: data || null,
    isAuthenticated: !!data,
    ...query,
  };
}
