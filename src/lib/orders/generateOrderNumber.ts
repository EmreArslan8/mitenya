import { supabaseAdmin } from '@/lib/supabase/admin';

export async function generateOrderNumber(): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc('next_order_number');
  if (error || !data) throw new Error(`Order number generation failed: ${error?.message}`);
  return data as string;
}
