import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@/shared/lib/client';
import type { User } from '@supabase/supabase-js';

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
      } = await supabase.auth.getUser();
      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  return {
    user: data || null,
    isAuthenticated: !!data,
    ...query,
  };
}
