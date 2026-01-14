'use client';

import { createBrowserClient } from '@supabase/ssr';

// Singleton pattern - tek bir client instance
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return browserClient;
}

// Hook for using Supabase client in components
export function useSupabase() {
  return createClient();
}