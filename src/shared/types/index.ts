export * from './feedback';
export * from './notes';
export * from './supabase';

export interface AISummaryData {
  mainStory: string;
  keyEvents: string[];
  emotionalMoments: string[];
  ideas: string[];
  triggers: string[];
  resources: string[];
  progress: string[];
  observations: string[];
  recommendations: string[];
  conclusion: string[];
}

export interface WeeklySummaryWithMetadata extends AISummaryData {
  id: string;
  created_at: string | null;
  user_id: string | null;
  week_start_date: string;
  week_end_date: string;
}
