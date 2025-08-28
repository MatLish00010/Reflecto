import type { ApiContext } from '@/shared/common/types';
import {
  DailySummaryService,
  FeedbackService,
  NotesService,
  OpenAIService,
  RedisService,
  SpeechToTextService,
  StripeService,
  WeeklySummaryService,
} from '@/shared/server/lib/api/services/server';
import { SubscriptionsService } from '@/shared/server/lib/api/services/subscriptions.service';

/* biome-ignore lint/complexity/noStaticOnlyClass: ServiceFactory pattern is used for dependency injection */
export class ServiceFactory {
  static createNotesService(supabase: ApiContext['supabase']) {
    return new NotesService(supabase);
  }

  static createFeedbackService(supabase: ApiContext['supabase']) {
    return new FeedbackService(supabase);
  }

  static createDailySummaryService(supabase: ApiContext['supabase']) {
    return new DailySummaryService(supabase);
  }

  static createWeeklySummaryService(supabase: ApiContext['supabase']) {
    return new WeeklySummaryService(supabase);
  }

  static createSubscriptionsService(supabase: ApiContext['supabase']) {
    return new SubscriptionsService(supabase);
  }

  static createSpeechToTextService() {
    return new SpeechToTextService();
  }

  static createOpenAIService(): OpenAIService {
    return new OpenAIService();
  }

  static createRedisService(): RedisService {
    return new RedisService();
  }

  static createStripeService(): StripeService {
    return new StripeService();
  }
}
