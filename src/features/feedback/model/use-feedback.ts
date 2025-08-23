import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackKeys } from '@/entities/feedback';
import { useUser } from '@/entities/user';
import { safeSentry } from '@/shared/lib/sentry';
import { useAlertContext } from '@/shared/providers/alert-provider';
import type { CreateFeedbackRequest, Feedback } from '@/shared/types';

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
