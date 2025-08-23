import type { Span } from '@sentry/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { decryptField, encryptField } from '@/shared/lib/crypto-field';
import { safeSentry } from '@/shared/lib/sentry';
import type { AISummaryData, WeeklySummaryWithMetadata } from '@/shared/types';
import type { Database } from '@/shared/types/supabase';

type SupabaseClientType = SupabaseClient<Database>;

export interface WeeklySummaryServiceOptions {
  span?: Span;
  operation?: string;
}

export class WeeklySummaryService {
  constructor(private supabase: SupabaseClientType) {}

  async fetchSingleSummary(
    userId: string,
    from: string,
    to: string,
    options: WeeklySummaryServiceOptions = {}
  ): Promise<AISummaryData | null> {
    const { span, operation = 'fetch_single_weekly_summary' } = options;

    const { data, error } = await this.supabase
      .from('weekly_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('week_start_date', from)
      .lte('week_end_date', to)
      .order('week_start_date', { ascending: false })
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
        operation: 'decrypt_weekly_summary',
        parse: true,
      });

    if (decryptError) {
      safeSentry.captureException(
        new Error('Failed to decrypt weekly summary'),
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

  async fetchSummaries(
    userId: string,
    from: string,
    to: string,
    options: WeeklySummaryServiceOptions = {}
  ): Promise<WeeklySummaryWithMetadata[]> {
    const { span, operation = 'fetch_weekly_summaries' } = options;

    const { data, error } = await this.supabase
      .from('weekly_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('week_start_date', from)
      .lte('week_end_date', to)
      .order('week_start_date', { ascending: false });

    if (error) {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { userId, from, to },
      });
      throw error;
    }

    if (!data || data.length === 0) {
      span?.setAttribute('summaries.found', false);
      return [];
    }

    const summaries: WeeklySummaryWithMetadata[] = [];

    for (const item of data) {
      const { value: decryptedSummary, error: decryptError } =
        decryptField<AISummaryData>({
          encrypted: item.summary as string,
          span,
          operation: 'decrypt_weekly_summary',
          parse: true,
        });

      if (decryptError) {
        safeSentry.captureException(
          new Error('Failed to decrypt weekly summary'),
          {
            tags: { operation },
            extra: { userId, itemId: item.id },
          }
        );
        throw decryptError;
      }

      // Add metadata to the decrypted summary
      const summaryWithMetadata: WeeklySummaryWithMetadata = {
        mainStory: decryptedSummary?.mainStory || '',
        keyEvents: decryptedSummary?.keyEvents || [],
        emotionalMoments: decryptedSummary?.emotionalMoments || [],
        ideas: decryptedSummary?.ideas || [],
        cognitivePatterns: decryptedSummary?.cognitivePatterns || [],
        behavioralPatterns: decryptedSummary?.behavioralPatterns || [],
        triggers: decryptedSummary?.triggers || [],
        resources: decryptedSummary?.resources || [],
        progress: decryptedSummary?.progress || [],
        observations: decryptedSummary?.observations || [],
        recommendations: decryptedSummary?.recommendations || [],
        copingStrategies: decryptedSummary?.copingStrategies || [],
        conclusion: decryptedSummary?.conclusion || [],
        id: item.id,
        created_at: item.created_at,
        user_id: item.user_id,
        week_start_date: item.week_start_date,
        week_end_date: item.week_end_date,
      };

      summaries.push(summaryWithMetadata);
    }

    span?.setAttribute('summaries.found', true);
    span?.setAttribute('summaries.count', summaries.length);
    return summaries;
  }

  async saveSummary(
    summary: AISummaryData,
    userId: string,
    weekStartDate: string,
    options: WeeklySummaryServiceOptions = {}
  ): Promise<{ success: boolean; action: 'created' | 'updated' }> {
    const { span, operation = 'save_weekly_summary' } = options;

    // Encrypt the summary
    const { value: encryptedSummary, error: encryptError } = encryptField({
      data: summary,
      span,
      operation: 'encrypt_weekly_summary',
    });

    if (encryptError) {
      safeSentry.captureException(
        new Error('Failed to encrypt weekly summary'),
        {
          tags: { operation },
          extra: { userId },
        }
      );
      throw encryptError;
    }

    // Check if summary already exists
    const { data: existing, error: selectError } = await this.supabase
      .from('weekly_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('week_start_date', weekStartDate)
      .lte(
        'week_end_date',
        new Date(new Date(weekStartDate).getTime() + 6 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      )
      .order('week_start_date', { ascending: false })
      .limit(1)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      safeSentry.captureException(selectError, {
        tags: { operation },
        extra: { userId, weekStartDate },
      });
      throw selectError;
    }

    if (existing) {
      // Update existing summary
      const { error: updateError } = await this.supabase
        .from('weekly_summaries')
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
      const weekStart = new Date(weekStartDate);
      const { error: insertError } = await this.supabase
        .from('weekly_summaries')
        .insert({
          user_id: userId,
          summary: encryptedSummary as string,
          week_start_date: weekStart.toISOString().split('T')[0],
          week_end_date: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        });

      if (insertError) {
        safeSentry.captureException(insertError, {
          tags: { operation },
          extra: { userId, weekStartDate },
        });
        throw insertError;
      }

      span?.setAttribute('summary.action', 'created');
      return { success: true, action: 'created' };
    }
  }
}
