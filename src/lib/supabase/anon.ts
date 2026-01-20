import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton pattern - API routes için anon client
let anonClient: SupabaseClient | null = null;

/**
 * API routes ve server-side data fetching için singleton Supabase client
 * Auth gerektirmeyen public data çekimi için kullanılır
 */
export function getSupabaseAnon(): SupabaseClient {
  if (anonClient) {
    return anonClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  anonClient = createClient(url, anonKey);

  return anonClient;
}
