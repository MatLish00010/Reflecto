import { createBrowserClient } from '@supabase/ssr';

import { ENV } from '@/shared/common/config';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseKey = ENV.SUPABASE_ANON_KEY;

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
};
