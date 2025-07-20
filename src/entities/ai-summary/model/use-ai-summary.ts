import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/entities/user';
import { safeSentry } from '@/shared/lib/sentry';

export const aiSummaryKeys = {
  all: (userId: string) => ['ai-summary', userId] as const,
  lists: (userId: string) => [...aiSummaryKeys.all(userId), 'list'] as const,
  list: (userId: string, date?: string) =>
    [...aiSummaryKeys.lists(userId), date] as const,
  details: (userId: string) =>
    [...aiSummaryKeys.all(userId), 'detail'] as const,
  detail: (userId: string, date: string) =>
    [...aiSummaryKeys.details(userId), date] as const,
};

export function useAISummaryByDateRange(from?: string, to?: string) {
  const { user } = useUser();

  return useQuery({
    queryKey: aiSummaryKeys.list(user?.id || '', `${from}-${to}`),
    queryFn: async () => {
      if (!user) {
        const error = new Error('User not found');
        safeSentry.captureException(error, {
          tags: { operation: 'get_ai_summary_by_date_range' },
        });
        throw error;
      }

      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const res = await fetch(`/api/ai-summary?${params.toString()}`, {
        method: 'GET',
      });
      if (!res.ok) {
        const error = new Error('Failed to fetch summary');
        safeSentry.captureException(error, {
          tags: { operation: 'get_ai_summary_by_date_range' },
          extra: { userId: user.id, from, to, status: res.status },
        });
        throw error;
      }
      const data = await res.json();
      return data.summary;
    },
    enabled: !!user,
    retry: false,
  });
}

export function useTodayAISummary() {
  const { user } = useUser();
  return useQuery({
    queryKey: aiSummaryKeys.detail(user?.id || '', 'today'),
    queryFn: async () => {
      if (!user) {
        const error = new Error('User not found');
        safeSentry.captureException(error, {
          tags: { operation: 'get_today_ai_summary' },
        });
        throw error;
      }
      const res = await fetch('/api/ai-summary', { method: 'GET' });
      if (!res.ok) {
        const error = new Error('Failed to fetch summary');
        safeSentry.captureException(error, {
          tags: { operation: 'get_today_ai_summary' },
          extra: { userId: user.id, status: res.status },
        });
        throw error;
      }
      const data = await res.json();
      return data.summary;
    },
    enabled: !!user,
    retry: false,
  });
}
