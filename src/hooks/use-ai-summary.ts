import { useMutation } from '@tanstack/react-query';

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
