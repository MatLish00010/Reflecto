import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/use-user';

export function useAISummary() {
  return useMutation({
    mutationFn: async (notes: string[]) => {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
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
    queryKey: ['ai-summary', user?.id],
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

export function useSaveAISummary() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (notes: string[]) => {
      if (!user) throw new Error('User not found');
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to save summary');
      const data = await res.json();
      return data.summary;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-summary', user?.id] });
    },
  });
}
