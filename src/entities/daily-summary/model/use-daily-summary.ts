import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/entities/user';
import { safeSentry } from '@/shared/lib/sentry';

export const dailySummaryKeys = {
  all: (userId: string) => ['daily-summary', userId] as const,
  lists: (userId: string) => [...dailySummaryKeys.all(userId), 'list'] as const,
  list: (userId: string, date?: string) =>
    [...dailySummaryKeys.lists(userId), date] as const,
  details: (userId: string) =>
    [...dailySummaryKeys.all(userId), 'detail'] as const,
  detail: (userId: string, date: string) =>
    [...dailySummaryKeys.details(userId), date] as const,
};

export function useDailySummaryByDateRange(from?: string, to?: string) {
  const { user } = useUser();

  return useQuery({
    queryKey: dailySummaryKeys.list(user?.id || '', `${from}-${to}`),
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

      const res = await fetch(`/api/daily-summary?${params.toString()}`, {
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
      return data.summary || null;
    },
    enabled: !!user,
    retry: false,
  });
}

export function useTodayAISummary() {
  const { user } = useUser();
  return useQuery({
    queryKey: dailySummaryKeys.detail(user?.id || '', 'today'),
    queryFn: async () => {
      if (!user) {
        const error = new Error('User not found');
        safeSentry.captureException(error, {
          tags: { operation: 'get_today_ai_summary' },
        });
        throw error;
      }
      const res = await fetch('/api/daily-summary', { method: 'GET' });
      if (!res.ok) {
        const error = new Error('Failed to fetch summary');
        safeSentry.captureException(error, {
          tags: { operation: 'get_today_ai_summary' },
          extra: { userId: user.id, status: res.status },
        });
        throw error;
      }
      const data = await res.json();
      return data.summary || null;
    },
    enabled: !!user,
    retry: false,
  });
}

export function useDailySummariesByDateRange(from?: string, to?: string) {
  const { user } = useUser();

  return useQuery({
    queryKey: dailySummaryKeys.list(
      user?.id || '',
      `daily-summaries-${from}-${to}`
    ),
    queryFn: async () => {
      if (!user) {
        const error = new Error('User not found');
        safeSentry.captureException(error, {
          tags: { operation: 'get_daily_summaries_by_date_range' },
        });
        throw error;
      }

      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      params.append('returnAll', 'true');

      const res = await fetch(`/api/daily-summary?${params.toString()}`, {
        method: 'GET',
      });
      if (!res.ok) {
        const error = new Error('Failed to fetch daily summaries');
        safeSentry.captureException(error, {
          tags: { operation: 'get_daily_summaries_by_date_range' },
          extra: { userId: user.id, from, to, status: res.status },
        });
        throw error;
      }
      const data = await res.json();
      return data.summaries || [];
    },
    enabled: !!user && !!from && !!to,
    retry: false,
  });
}
