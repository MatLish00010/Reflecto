import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/entities/user';
import { CreateFeedbackRequest, Feedback } from '@/shared/types';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { safeSentry } from '@/shared/lib/sentry';

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
      if (!user) {
        const error = new Error('User not found');
        safeSentry.captureException(error, {
          tags: { operation: 'fetch_feedback' },
        });
        throw error;
      }

      const response = await fetch('/api/feedback');
      if (!response.ok) {
        if (response.status === 401) {
          return [];
        }

        const errorData = await response
          .json()
          .catch(() => ({ error: 'Failed to fetch feedback' }));
        const error = new Error(errorData.error || 'Failed to fetch feedback');
        safeSentry.captureException(error, {
          tags: { operation: 'fetch_feedback' },
          extra: { userId: user.id, status: response.status },
        });
        throw error;
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
      if (!user) {
        const error = new Error('User not found');
        safeSentry.captureException(error, {
          tags: { operation: 'create_feedback' },
        });
        throw error;
      }

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
        const error = new Error(errorData.error || 'Failed to create feedback');
        safeSentry.captureException(error, {
          tags: { operation: 'create_feedback' },
          extra: {
            userId: user.id,
            feedbackType: data.type,
            status: response.status,
          },
        });
        throw error;
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.lists(user?.id || ''),
      });
    },
    onError: error => {
      safeSentry.captureException(error as Error, {
        tags: { operation: 'create_feedback' },
        extra: { userId: user?.id },
      });
      showError(error.message);
    },
  });
}
