import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export const userKeys = {
  all: ['user'] as const,
};

export function useUser() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: userKeys.all,
    queryFn: async (): Promise<User> => {
      const supabase = createClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw new Error(error.message);
      }

      if (!user) {
        throw new Error('Not authenticated');
      }

      return user;
    },
    retry: false,
  });

  return {
    user: data || null,
    isLoading,
    error: error?.message || null,
    isAuthenticated: !!data,
    refetch,
  };
}
