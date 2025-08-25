import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/entities/user';
import { createDateBasedEntityKeys } from '@/shared/lib/query-keys';
import { safeSentry } from '@/shared/lib/sentry';

export const dailySummaryKeys = createDateBasedEntityKeys('daily-summary');

export function useDailySummaryByDateRange(from?: string, to?: string) {
  const { user } = useUser();

  return useQuery({
    queryKey: dailySummaryKeys.list(user?.id || '', `${from}-${to}`),
    queryFn: async () => {
      if (!user) {
        const error = new Error('User not found');
        safeSentry.captureException(error, {
          tags: { operation: 'get_daily_summary_by_date_range' },
        });
        throw error;
      }

      const params = new URLSearchParams();
      if (from) {
        params.append('from', from);
      }
      if (to) {
        params.append('to', to);
      }

      const res = await fetch(`/api/daily-summary?${params.toString()}`, {
        method: 'GET',
      });
      if (!res.ok) {
        const error = new Error('Failed to fetch summary');
        safeSentry.captureException(error, {
          tags: { operation: 'get_daily_summary_by_date_range' },
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
    queryKey: dailySummaryKeys.today(user?.id || ''),
    queryFn: async () => {
      if (!user) {
        const error = new Error('User not found');
        safeSentry.captureException(error, {
          tags: { operation: 'get_daily_summary' },
        });
        throw error;
      }
      const res = await fetch('/api/daily-summary', { method: 'GET' });
      if (!res.ok) {
        const error = new Error('Failed to fetch summary');
        safeSentry.captureException(error, {
          tags: { operation: 'get_today_daily_summary' },
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

export function useDailySummary(from: string, to: string) {
  const { user, isAuthenticated } = useUser();

  return useQuery({
    queryKey: dailySummaryKeys.detail(user?.id || '', from, to),
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        return null;
      }

      const params = new URLSearchParams();
      params.append('from', from);
      params.append('to', to);

      const res = await fetch(`/api/daily-summary?${params.toString()}`, {
        method: 'GET',
      });
      if (!res.ok) {
        const error = new Error('Failed to fetch daily summary');
        safeSentry.captureException(error, {
          tags: { operation: 'get_daily_summary' },
          extra: { userId: user.id, from, to, status: res.status },
        });
        throw error;
      }
      const data = await res.json();
      return data.summary || null;
    },
    enabled: isAuthenticated && !!user && !!from && !!to,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function useDailySummaries(from?: string, to?: string) {
  const { user, isAuthenticated } = useUser();

  return useQuery({
    queryKey: dailySummaryKeys.summariesList(user?.id || '', from, to),
    queryFn: async () => {
      if (!isAuthenticated || !user) {
        return [];
      }

      const params = new URLSearchParams();
      if (from) {
        params.append('from', from);
      }
      if (to) {
        params.append('to', to);
      }

      const res = await fetch(`/api/daily-summaries?${params.toString()}`, {
        method: 'GET',
      });
      if (!res.ok) {
        const error = new Error('Failed to fetch daily summaries');
        safeSentry.captureException(error, {
          tags: { operation: 'get_daily_summaries' },
          extra: { userId: user.id, from, to, status: res.status },
        });
        throw error;
      }
      const data = await res.json();
      return data.summaries || [];
    },
    enabled: isAuthenticated && !!user && !!from && !!to,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}
