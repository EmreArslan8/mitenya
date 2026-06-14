import { pushItemToDataLayer } from './dataLayer';
 
export const signOut = async () => {
  // perf: signOut anında dynamic import
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
 
  // Get current user before signing out
  const { data: { user } } = await supabase.auth.getUser();
 
  if (user?.id) {
    pushItemToDataLayer({ event: 'log_out', userId: user.id });
  }
 
  // Sign out from Supabase
  await supabase.auth.signOut();
 
  // Redirect to home
  window.location.href = process.env.NEXT_PUBLIC_HOST_URL || '/';
};