export * from './notes';
export * from './feedback';
export * from './supabase';

export interface AISummaryData {
  mainStory: string;
  keyEvents: string[];
  emotionalMoments: string[];
  ideas: string[];
  cognitivePatterns: string[];
  behavioralPatterns: string[];
  triggers: string[];
  resources: string[];
  progress: string[];
  observations: string[];
  recommendations: string[];
  copingStrategies: string[];
  conclusion: string[];
}
