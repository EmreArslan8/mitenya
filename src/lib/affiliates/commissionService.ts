import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Sipariş oluşunca çağrılır. affiliate_code varsa komisyon kaydı oluşturur.
 */
export async function createAffiliateConversion(params: {
  affiliateCode: string;
  orderId: string;
  orderNumber: string;
  orderAmount: number;
  affiliateClickId?: string | null;
}) {
  const { affiliateCode, orderId, orderNumber, orderAmount, affiliateClickId } = params;

  try {
    const { data: affiliate, error } = await supabaseAdmin
      .from('affiliates')
      .select('id, commission_rate, status')
      .eq('code', affiliateCode)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !affiliate) return;

    const commissionAmount = parseFloat((orderAmount * affiliate.commission_rate).toFixed(2));

    const { data: existingConversion } = await supabaseAdmin
      .from('affiliate_conversions')
      .select('id')
      .eq('affiliate_id', affiliate.id)
      .eq('order_id', orderId)
      .maybeSingle();

    if (!existingConversion) {
      await supabaseAdmin.from('affiliate_conversions').insert({
        affiliate_id: affiliate.id,
        order_id: orderId,
        order_number: orderNumber,
        order_amount: orderAmount,
        commission_rate: affiliate.commission_rate,
        commission_amount: commissionAmount,
        status: 'pending',
      });
    }

    if (affiliateClickId) {
      await supabaseAdmin
        .from('affiliate_clicks')
        .update({ converted: true })
        .eq('id', affiliateClickId)
        .eq('affiliate_id', affiliate.id);
    }
  } catch {
    // Komisyon kaydı başarısız olsa bile sipariş akışı durmamalı
  }
}
