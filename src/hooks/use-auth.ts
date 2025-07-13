import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Tables } from '@/types/supabase';
import { userKeys } from './use-user';

type User = Tables<'users'>;

interface LoginResponse {
  user: User;
}

interface LoginRequest {
  code: string;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to login');
      }

      return response.json();
    },
    onSuccess: data => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: userKeys.all });

      // Set user data in cache
      queryClient.setQueryData(userKeys.all, data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      return response.json();
    },
    onSuccess: () => {
      // Clear user data from cache
      queryClient.setQueryData(userKeys.all, null);

      // Invalidate all user-related queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
