import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/entities/user';
import { CreateFeedbackRequest, Feedback } from '@/shared/types';
import { useAlertContext } from '@/shared/providers/alert-provider';

export const feedbackKeys = {
  all: (userId: string) => ['feedback', userId] as const,
  lists: (userId: string) => [...feedbackKeys.all(userId), 'list'] as const,
  list: (userId: string) => [...feedbackKeys.lists(userId)] as const,
};

export function useFeedback() {
  const { user } = useUser();

  const query = useQuery({
    queryKey: feedbackKeys.list(user?.id || ''),
    queryFn: async (): Promise<Feedback[]> => {
      if (!user) throw new Error('User not found');

      const response = await fetch('/api/feedback');
      if (!response.ok) {
        if (response.status === 401) {
          return [];
        }

        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to fetch feedback' }));
        throw new Error(errorData.error || 'Failed to fetch feedback');
      }
      return response.json();
    },
    enabled: !!user,
    retry: false,
  });

  return {
    ...query,
    data: query.data || [],
  };
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (data: CreateFeedbackRequest): Promise<Feedback> => {
      if (!user) throw new Error('User not found');

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create feedback');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.lists(user?.id || ''),
      });
    },
    onError: error => {
      showError(error.message);
    },
  });
}
