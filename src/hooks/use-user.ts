import { useQuery } from '@tanstack/react-query';
import type { Tables } from '@/types/supabase';

// userKeys аналогично noteKeys
export const userKeys = {
  all: ['user'] as const,
};

type User = Tables<'users'>;

export function useUser(initialUser?: User | null) {
  const {
    data: user,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: userKeys.all,
    queryFn: async (): Promise<User> => {
      const response = await fetch('/api/user/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Not authenticated');
        }
        throw new Error('Failed to fetch user');
      }

      const { user: userData } = await response.json();
      return userData;
    },
    initialData: initialUser,
    retry: false,
  });

  return {
    user: user || null,
    loading,
    error: error?.message || null,
    isAuthenticated: !!user,
    refetch,
  };
}
