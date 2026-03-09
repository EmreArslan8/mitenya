import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: affiliate, error: affiliateError } = await supabaseAdmin
      .from('affiliates')
      .select('id, code, name, commission_rate, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (affiliateError || !affiliate) {
      return NextResponse.json({ error: 'Influencer hesabı bulunamadı' }, { status: 404 });
    }

    const [clicksResult, conversionsResult] = await Promise.all([
      supabaseAdmin
        .from('affiliate_clicks')
        .select('id, converted, created_at')
        .eq('affiliate_id', affiliate.id),
      supabaseAdmin
        .from('affiliate_conversions')
        .select('id, order_number, order_amount, commission_rate, commission_amount, status, created_at')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    const clicks = clicksResult.data ?? [];
    const conversions = conversionsResult.data ?? [];

    const totalClicks = clicks.length;
    const approvedCommission = conversions
      .filter((c) => c.status === 'approved' || c.status === 'paid')
      .reduce((sum, c) => sum + Number(c.commission_amount), 0);
    const pendingCommission = conversions
      .filter((c) => c.status === 'pending')
      .reduce((sum, c) => sum + Number(c.commission_amount), 0);
    const totalSales = conversions.length;

    return NextResponse.json({
      affiliate: {
        code: affiliate.code,
        name: affiliate.name,
        commissionRate: affiliate.commission_rate,
      },
      stats: {
        totalClicks,
        totalSales,
        approvedCommission: parseFloat(approvedCommission.toFixed(2)),
        pendingCommission: parseFloat(pendingCommission.toFixed(2)),
      },
      clickEvents: clicks.map((click) => ({
        id: click.id,
        created_at: click.created_at,
        converted: click.converted,
      })),
      conversions,
    });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
