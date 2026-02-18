import { supabaseAdmin } from '@/lib/supabase/admin';

export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  const { data } = await supabaseAdmin
    .from('orders')
    .select('order_number')
    .like('order_number', `${prefix}%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;
  if (data?.order_number) {
    const lastNumber = parseInt(data.order_number.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(5, '0')}`;
}
