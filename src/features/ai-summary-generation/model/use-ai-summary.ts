import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/entities/user';
import { useTranslation } from '@/shared/contexts/translation-context';
import { safeSentry } from '@/shared/lib/sentry';
import { aiSummaryKeys } from '@/entities/ai-summary';

export function useAISummary() {
  const { lang } = useTranslation();

  return useMutation({
    mutationFn: async ({ notes, date }: { notes: string[]; date?: string }) => {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, locale: lang, date }),
      });
      if (!res.ok) {
        const error = new Error('Failed to get summary');
        safeSentry.captureException(error, {
          tags: { operation: 'get_ai_summary' },
          extra: {
            notesCount: notes.length,
            locale: lang,
            date,
            status: res.status,
          },
        });
        throw error;
      }
      const data = await res.json();
      return data.summary;
    },
  });
}

export function useCreateSummary() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { lang } = useTranslation();

  return useMutation({
    mutationFn: async ({
      notes,
      from,
      to,
    }: {
      notes: string[];
      from: string;
      to: string;
    }) => {
      if (!user) {
        const error = new Error('User not found');
        safeSentry.captureException(error, {
          tags: { operation: 'create_ai_summary' },
        });
        throw error;
      }
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, locale: lang, from, to }),
      });
      if (!res.ok) {
        const data = await res.json();
        const error = new Error(data.error);
        safeSentry.captureException(error, {
          tags: { operation: 'create_ai_summary' },
          extra: {
            userId: user.id,
            notesCount: notes.length,
            locale: lang,
            from,
            to,
            status: res.status,
          },
        });
        throw error;
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
