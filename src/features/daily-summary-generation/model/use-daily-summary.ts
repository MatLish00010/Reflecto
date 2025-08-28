import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dailySummaryKeys } from '@/entities/daily-summary';
import { useUser } from '@/entities/user';
import { useTranslation } from '@/shared/client/contexts/translation-context';
import { API_CONFIG } from '@/shared/common/config';
import { safeSentry } from '@/shared/common/lib/sentry';

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
          tags: { operation: 'create_daily_summary' },
        });
        throw error;
      }
      const res = await fetch(API_CONFIG.ENDPOINTS.DAILY_SUMMARY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, locale: lang, from, to }),
      });
      if (!res.ok) {
        const data = await res.json();
        const error = new Error(data.error);
        safeSentry.captureException(error, {
          tags: { operation: 'create_daily_summary' },
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
    onSuccess: (data, { from, to }) => {
      queryClient.setQueryData(
        dailySummaryKeys.list(user?.id || '', `${from}-${to}`),
        data
      );
    },
  });
}
