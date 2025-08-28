import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackKeys } from '@/entities/feedback';
import { useUser } from '@/entities/user';
import { useAlertContext } from '@/shared/client/providers/alert-provider';
import { API_CONFIG } from '@/shared/common/config';
import { safeSentry } from '@/shared/common/lib/sentry';
import type { CreateFeedbackRequest, Feedback } from '@/shared/common/types';

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

      const response = await fetch(API_CONFIG.ENDPOINTS.FEEDBACK, {
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
