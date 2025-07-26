import type { ApiContext } from '@/shared/lib/api';
import {
  NotesService,
  FeedbackService,
  DailySummaryService,
  WeeklySummaryService,
  SpeechToTextService,
} from '@/shared/lib/api/services';

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
}
