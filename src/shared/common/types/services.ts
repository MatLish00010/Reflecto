// Service Types
import type { Span } from '@sentry/types';
import type Stripe from 'stripe';

export interface ServiceOptions {
  span?: Span;
  operation?: string;
}

export interface RedisServiceOptions extends ServiceOptions {
  redisUrl?: string;
}

export interface DailySummaryServiceOptions extends ServiceOptions {
  tableName?: string;
}

export interface WeeklySummaryServiceOptions extends ServiceOptions {
  tableName?: string;
}

export interface NotesServiceOptions extends ServiceOptions {
  tableName?: string;
}

export interface Note {
  id: number;
  note: string | null;
  user_id: string | null;
  created_at: string;
}

export interface CreateNoteParams {
  note: string;
  userId: string;
  options?: NotesServiceOptions;
}

export interface UpdateNoteParams {
  noteId: number;
  note: string;
  userId: string;
  options?: NotesServiceOptions;
}

export interface DeleteNoteParams {
  noteId: number;
  userId: string;
  options?: NotesServiceOptions;
}

export interface FetchNotesParams {
  userId: string;
  from?: string;
  to?: string;
  options?: NotesServiceOptions;
}

export interface FeedbackServiceOptions extends ServiceOptions {
  tableName?: string;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  description: string;
  created_at: string | null;
  updated_at: string | null;
  priority: string | null;
  status: string | null;
}

export interface CreateFeedbackParams {
  userId: string;
  type: 'bug' | 'feature' | 'improvement';
  title: string;
  description: string;
  options?: FeedbackServiceOptions;
}

export interface FetchFeedbackParams {
  userId: string;
  options?: FeedbackServiceOptions;
}

export interface StripeServiceOptions extends ServiceOptions {
  secretKey?: string;
  webhookSecret?: string;
}

export interface SpeechToTextServiceOptions extends ServiceOptions {
  apiKey?: string;
  model?: string;
}

export interface OpenAIServiceOptions extends ServiceOptions {
  apiKey?: string;
  model?: string;
}

export interface SubscriptionsServiceOptions extends ServiceOptions {
  tableName?: string;
}

// OpenAI Types
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CallOpenAIParams {
  messages: string;
  prompt: string;
  options?: OpenAIServiceOptions;
}

export interface CallOpenAIAndParseJSONParams {
  messages: string;
  prompt: string;
  options?: OpenAIServiceOptions;
}

export interface ValidateAISummaryStructureParams {
  summary: Record<string, unknown>;
  requiredFields: string[];
  arrayFields: string[];
  options?: OpenAIServiceOptions;
}

// Stripe Types
export interface StripeProductsResult {
  products: Stripe.Product[];
  prices: Stripe.Price[];
}

export interface StripeCheckoutSessionResult {
  url: string | null;
}

export interface StripePortalSessionResult {
  url: string | null;
}

// Speech-to-Text Types
export interface TranscriptionResult {
  text: string;
  confidence: number;
  promptUsed?: boolean;
}

export interface TranscribeAudioParams {
  audioFile: File;
  prompt?: string;
  options?: SpeechToTextServiceOptions;
}
