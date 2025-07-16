import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/use-user';
import { useTranslation } from '@/contexts/translation-context';

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

export function useAISummary() {
  const { lang } = useTranslation();

  return useMutation({
    mutationFn: async (notes: string[]) => {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, locale: lang }),
      });
      if (!res.ok) throw new Error('Failed to get summary');
      const data = await res.json();
      return data.summary;
    },
  });
}

export function useTodayAISummary() {
  const { user } = useUser();
  return useQuery({
    queryKey: aiSummaryKeys.detail(user?.id || '', 'today'),
    queryFn: async () => {
      if (!user) throw new Error('User not found');
      const res = await fetch('/api/ai-summary', { method: 'GET' });
      if (!res.ok) throw new Error('Failed to fetch summary');
      const data = await res.json();
      return data.summary;
    },
    enabled: !!user,
    retry: false,
  });
}

export function useAISummaryByDateRange(from?: string, to?: string) {
  const { user } = useUser();

  return useQuery({
    queryKey: aiSummaryKeys.list(user?.id || '', `${from}-${to}`),
    queryFn: async () => {
      if (!user) throw new Error('User not found');

      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const res = await fetch(`/api/ai-summary?${params.toString()}`, {
        method: 'GET',
      });
      if (!res.ok) throw new Error('Failed to fetch summary');
      const data = await res.json();
      return data.summary;
    },
    enabled: !!user,
    retry: false,
  });
}

export function useSaveAISummary() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { lang } = useTranslation();

  return useMutation({
    mutationFn: async (notes: string[]) => {
      if (!user) throw new Error('User not found');
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, locale: lang }),
      });
      if (!res.ok) {
        const data = await res.json();

        throw new Error(data.error);
      }
      const data = await res.json();
      return data.summary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: aiSummaryKeys.all(user?.id || ''),
      });
    },
  });
}
