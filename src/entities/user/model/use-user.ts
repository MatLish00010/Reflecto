import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/shared/lib/client';
import type { User } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';

export const userKeys = {
  all: ['user'] as const,
};

export function useUser() {
  const { data, ...query } = useQuery({
    queryKey: userKeys.all,
    queryFn: async (): Promise<User> => {
      const supabase = createBrowserClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        Sentry.captureException(error);
        throw new Error(error.message);
      }

      if (!user) {
        const error = new Error('Not authenticated');
        Sentry.captureException(error);
        throw error;
      }

      return user;
    },
    retry: false,
  });

  return {
    user: data || null,
    isAuthenticated: !!data,
    ...query,
  };
}
