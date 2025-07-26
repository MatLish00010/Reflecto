import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/entities/user';
import { useAlertContext } from '@/shared/providers/alert-provider';
import { safeSentry } from '@/shared/lib/sentry';
import { weeklySummaryKeys } from '@/entities/weekly-summary';
import type { AISummaryData } from '@/shared/types';

interface CreateWeeklySummaryRequest {
  from: string;
  to: string;
  locale?: string;
}

export function useCreateWeeklySummary() {
  const { user, isAuthenticated } = useUser();
  const queryClient = useQueryClient();
  const { showError } = useAlertContext();

  return useMutation({
    mutationFn: async (
      data: CreateWeeklySummaryRequest
    ): Promise<AISummaryData> => {
      if (!isAuthenticated || !user) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/weekly-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: data.from,
          to: data.to,
          locale: data.locale || 'ru',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(
          errorData.error || 'Failed to create weekly summary'
        );
        safeSentry.captureException(error, {
          tags: { operation: 'create_weekly_summary' },
          extra: {
            userId: user.id,
            from: data.from,
            to: data.to,
            status: response.status,
          },
        });
        throw error;
      }

      const result = await response.json();
      return result.summary;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: weeklySummaryKeys.detail(
          user?.id || '',
          `${variables.from}-${variables.to}`
        ),
      });

      queryClient.setQueryData(
        weeklySummaryKeys.detail(
          user?.id || '',
          `${variables.from}-${variables.to}`
        ),
        data
      );
    },
    onError: (error: Error) => {
      safeSentry.captureException(error, {
        tags: { operation: 'create_weekly_summary' },
      });
      showError(error.message);
    },
  });
}
