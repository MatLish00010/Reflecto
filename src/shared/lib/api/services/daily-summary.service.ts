import type { Span } from '@sentry/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { decryptField, encryptField } from '@/shared/lib/crypto-field';
import { safeSentry } from '@/shared/lib/sentry';
import type { AISummaryData } from '@/shared/types';
import type { Database } from '@/shared/types/supabase';

type SupabaseClientType = SupabaseClient<Database>;

export interface DailySummaryServiceOptions {
  span?: Span;
  operation?: string;
}

export class DailySummaryService {
  constructor(private supabase: SupabaseClientType) {}

  async fetchSummaries(
    userId: string,
    from: string,
    to: string,
    options: DailySummaryServiceOptions = {}
  ): Promise<AISummaryData[]> {
    const { span, operation = 'fetch_daily_summaries' } = options;

    const { data: summaries, error } = await this.supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', from)
      .lt('created_at', to)
      .order('created_at', { ascending: true });

    if (error) {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { userId, from, to },
      });
      throw error;
    }

    const decryptedSummaries: AISummaryData[] = [];

    for (const item of summaries || []) {
      const { value: decryptedSummary, error: decryptError } =
        decryptField<AISummaryData>({
          encrypted: item.summary as string,
          span,
          operation: 'decrypt_daily_summary',
          parse: true,
        });

      if (decryptError) {
        safeSentry.captureException(
          new Error('Failed to decrypt daily summary'),
          {
            tags: { operation },
            extra: { userId, itemId: item.id },
          }
        );
        throw decryptError;
      }

      if (decryptedSummary) {
        decryptedSummaries.push(decryptedSummary);
      }
    }

    return decryptedSummaries;
  }

  async fetchSingleSummary(
    userId: string,
    from: string,
    to: string,
    options: DailySummaryServiceOptions = {}
  ): Promise<AISummaryData | null> {
    const { span, operation = 'fetch_single_daily_summary' } = options;

    const { data, error } = await this.supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', from)
      .lt('created_at', to)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { userId, from, to },
      });
      throw error;
    }

    if (!data) {
      span?.setAttribute('summary.found', false);
      return null;
    }

    const { value: decryptedSummary, error: decryptError } =
      decryptField<AISummaryData>({
        encrypted: data.summary as string,
        span,
        operation: 'decrypt_daily_summary',
        parse: true,
      });

    if (decryptError) {
      safeSentry.captureException(
        new Error('Failed to decrypt daily summary'),
        {
          tags: { operation },
          extra: { userId, itemId: data.id },
        }
      );
      throw decryptError;
    }

    span?.setAttribute('summary.found', true);
    return decryptedSummary || null;
  }

  async saveSummary(
    summary: AISummaryData,
    userId: string,
    dateValue: string,
    options: DailySummaryServiceOptions = {}
  ): Promise<{ success: boolean; action: 'created' | 'updated' }> {
    const { span, operation = 'save_daily_summary' } = options;

    // Encrypt the summary
    const { value: encryptedSummary, error: encryptError } = encryptField({
      data: summary,
      span,
      operation: 'encrypt_daily_summary',
    });

    if (encryptError) {
      safeSentry.captureException(
        new Error('Failed to encrypt daily summary'),
        {
          tags: { operation },
          extra: { userId },
        }
      );
      throw encryptError;
    }

    // Check if summary already exists
    const { data: existing, error: selectError } = await this.supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', dateValue)
      .lt(
        'created_at',
        new Date(
          new Date(dateValue).getTime() + 24 * 60 * 60 * 1000
        ).toISOString()
      )
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      safeSentry.captureException(selectError, {
        tags: { operation },
        extra: { userId, dateValue },
      });
      throw selectError;
    }

    if (existing) {
      // Update existing summary
      const { error: updateError } = await this.supabase
        .from('daily_summaries')
        .update({ summary: encryptedSummary as string })
        .eq('id', existing.id);

      if (updateError) {
        safeSentry.captureException(updateError, {
          tags: { operation },
          extra: { userId, summaryId: existing.id },
        });
        throw updateError;
      }

      span?.setAttribute('summary.action', 'updated');
      return { success: true, action: 'updated' };
    } else {
      // Create new summary
      const { error: insertError } = await this.supabase
        .from('daily_summaries')
        .insert({
          user_id: userId,
          summary: encryptedSummary as string,
          created_at: dateValue,
        });

      if (insertError) {
        safeSentry.captureException(insertError, {
          tags: { operation },
          extra: { userId, dateValue },
        });
        throw insertError;
      }

      span?.setAttribute('summary.action', 'created');
      return { success: true, action: 'created' };
    }
  }
}
