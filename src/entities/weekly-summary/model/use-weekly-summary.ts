import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/entities/user';
import { createDateBasedEntityKeys } from '@/shared/client/lib/query-keys';
import { safeSentry } from '@/shared/common/lib/sentry';
import type { AISummaryData } from '@/shared/common/types';

export const weeklySummaryKeys = createDateBasedEntityKeys('weekly-summary');

export function useWeeklySummary(from: string, to: string) {
  const { user, isAuthenticated } = useUser();

  return useQuery({
    queryKey: weeklySummaryKeys.detail(user?.id || '', from, to),
    queryFn: async (): Promise<AISummaryData | null> => {
      if (!isAuthenticated || !user) {
        return null;
      }

      const params = new URLSearchParams();
      params.append('from', from);
      params.append('to', to);

      const response = await fetch(`/api/weekly-summary?${params.toString()}`);

      if (!response.ok) {
        const error = new Error('Failed to fetch weekly summary');
        safeSentry.captureException(error, {
          tags: { operation: 'get_weekly_summary' },
          extra: { userId: user.id, from, to, status: response.status },
        });
        throw error;
      }

      const data = await response.json();
      return data.summary || null;
    },
    enabled: isAuthenticated && !!user && !!from && !!to,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWeeklySummaries(from: string, to: string) {
  const { user, isAuthenticated } = useUser();

  return useQuery({
    queryKey: weeklySummaryKeys.summariesList(user?.id || '', from, to),
    queryFn: async (): Promise<AISummaryData[]> => {
      if (!isAuthenticated || !user) {
        return [];
      }

      const params = new URLSearchParams();
      params.append('from', from);
      params.append('to', to);

      const response = await fetch(
        `/api/weekly-summaries?${params.toString()}`
      );

      if (!response.ok) {
        const error = new Error('Failed to fetch weekly summaries');
        safeSentry.captureException(error, {
          tags: { operation: 'get_weekly_summaries' },
          extra: { userId: user.id, from, to, status: response.status },
        });
        throw error;
      }

      const data = await response.json();
      return data.summaries || [];
    },
    enabled: isAuthenticated && !!user && !!from && !!to,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
