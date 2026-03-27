import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Check if a user has purchased and received a specific product.
 * Returns true if the user has at least one delivered order containing the product.
 */
export async function hasDeliveredPurchase(
  supabase: SupabaseClient,
  productId: string,
  userEmail: string
): Promise<boolean> {
  const { data } = await supabase
    .from('order_items')
    .select('order_id, orders!inner(status, user_email)')
    .eq('product_id', productId)
    .eq('orders.user_email', userEmail)
    .eq('orders.status', 'delivered')
    .limit(1);

  return !!data && data.length > 0;
}
