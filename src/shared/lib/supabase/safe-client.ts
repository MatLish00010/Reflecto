/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createSafeClient = () => {
  const client = createBrowserClient(supabaseUrl!, supabaseKey!);

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
        } as any;
      }
      throw error;
    }
  };

  return client;
};
