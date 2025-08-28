import type { Tables } from './supabase';

// Re-export Supabase Note type
export type SupabaseNote = Tables<'notes'>;
