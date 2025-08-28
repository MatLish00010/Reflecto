import type { SupabaseClient } from '@supabase/supabase-js';
import { safeSentry } from '@/shared/common/lib/sentry';
import type { Database } from '@/shared/common/types/supabase';

type SupabaseClientType = SupabaseClient<Database>;

import type {
  CreateFeedbackParams,
  Feedback,
  FetchFeedbackParams,
} from '@/shared/common/types';

export class FeedbackService {
  constructor(private supabase: SupabaseClientType) {}

  async createFeedback({
    userId,
    type,
    title,
    description,
    options = {},
  }: CreateFeedbackParams): Promise<Feedback> {
    const { operation = 'create_feedback' } = options;

    const { data, error } = await this.supabase
      .from('feedback')
      .insert({
        user_id: userId,
        type,
        title,
        description,
      })
      .select()
      .single();

    if (error) {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { userId, type },
      });
      throw error;
    }

    return data;
  }

  async fetchFeedback({
    userId,
    options = {},
  }: FetchFeedbackParams): Promise<Feedback[]> {
    const { span, operation = 'fetch_feedback' } = options;

    const { data, error } = await this.supabase
      .from('feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      safeSentry.captureException(error, {
        tags: { operation },
        extra: { userId },
      });
      throw error;
    }

    span?.setAttribute('feedback.count', data?.length || 0);
    return data || [];
  }
}
