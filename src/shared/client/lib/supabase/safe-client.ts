/* biome-ignore lint/suspicious/noExplicitAny: Supabase client types require any */
import { createBrowserClient } from '@supabase/ssr';

import { ENV } from '@/shared/common/config';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseKey = ENV.SUPABASE_ANON_KEY;

export const createSafeClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  const client = createBrowserClient(supabaseUrl, supabaseKey);

  // Override the getUser method to handle auth errors gracefully
  const originalGetUser = client.auth.getUser.bind(client.auth);
  client.auth.getUser = async () => {
    try {
      return await originalGetUser();
    } catch (error) {
      // Don't throw auth session errors
      if (
        error instanceof Error &&
        (error.message.includes('Auth session missing') ||
          error.message.includes('Auth session not found'))
      ) {
        return {
          data: { user: null },
          error: null,
          // biome-ignore lint/suspicious/noExplicitAny: Supabase client types require any
        } as any;
      }
      throw error;
    }
  };

  // Override the getSession method to handle auth errors gracefully
  const originalGetSession = client.auth.getSession.bind(client.auth);
  client.auth.getSession = async () => {
    try {
      return await originalGetSession();
    } catch (error) {
      // Don't throw auth session errors
      if (
        error instanceof Error &&
        (error.message.includes('Auth session missing') ||
          error.message.includes('Auth session not found'))
      ) {
        return {
          data: { session: null },
          error: null,
          // biome-ignore lint/suspicious/noExplicitAny: Supabase client types require any
        } as any;
      }
      throw error;
    }
  };

  return client;
};
