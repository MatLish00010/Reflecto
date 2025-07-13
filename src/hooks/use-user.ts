import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useAlertContext } from '@/components/alert-provider';

export const userKeys = {
  all: ['user'] as const,
};

export function useUser() {
  const { showError } = useAlertContext();

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

  // Показываем ошибку, если она есть
  if (error) {
    showError(error.message);
  }

  return {
    user: data || null,
    isLoading,
    error: error?.message || null,
    isAuthenticated: !!data,
    refetch,
  };
}
