import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/entities/user';
import { createSimpleEntityKeys } from '@/shared/client/lib/query-keys';
import { API_CONFIG } from '@/shared/common/config';
import { safeSentry } from '@/shared/common/lib/sentry';
import type { Feedback } from '@/shared/common/types';

export const feedbackKeys = createSimpleEntityKeys('feedback');

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

      const response = await fetch(API_CONFIG.ENDPOINTS.FEEDBACK);
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
