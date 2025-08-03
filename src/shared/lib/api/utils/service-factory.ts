import type { ApiContext } from '@/shared/lib/api';
import {
  NotesService,
  FeedbackService,
  DailySummaryService,
  WeeklySummaryService,
  SpeechToTextService,
  OpenAIService,
  RedisService,
} from '@/shared/lib/api/services/server';

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

  static createSpeechToTextService() {
    return new SpeechToTextService();
  }

  static createOpenAIService(): OpenAIService {
    return new OpenAIService();
  }

  static createRedisService(): RedisService {
    return new RedisService();
  }
}
