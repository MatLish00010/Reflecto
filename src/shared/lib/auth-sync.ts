import { createBrowserClient } from '@/shared/lib/client';

/**
 * Synchronizes the auth session between server and client
 * This ensures that after OAuth callback, the client can access the session
 */
export async function syncAuthSession(): Promise<void> {
  try {
    const supabase = createBrowserClient();

    // Try to refresh the session to ensure it's up to date
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.warn('Failed to refresh session:', error.message);
    } else if (data.session) {
      console.log('Session refreshed successfully');
    }
  } catch (error) {
    console.warn('Session sync error:', error);
  }
}
