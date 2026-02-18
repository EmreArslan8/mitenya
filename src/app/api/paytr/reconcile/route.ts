import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createOrderFromCheckoutSession } from '@/lib/orders/createOrderFromCheckoutSession';

export async function POST(req: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
    }

    const header = req.headers.get('x-cron-secret') || '';
    if (header !== cronSecret) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const nowIso = new Date().toISOString();

    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('checkout_sessions')
      .select('*')
      .eq('status', 'finalizing')
      .is('order_id', null)
      .limit(200);

    if (sessionsError) {
      return NextResponse.json({ error: 'Failed to fetch finalizing sessions' }, { status: 500 });
    }

    let recovered = 0;
    let skipped = 0;

    for (const session of sessions || []) {
      const { data: attempt } = await supabaseAdmin
        .from('payment_attempts')
        .select('*')
        .eq('checkout_session_id', session.id)
        .eq('provider', 'paytr')
        .eq('status', 'success')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!attempt) {
        skipped += 1;
        continue;
      }

      const result = await createOrderFromCheckoutSession({
        supabase: supabaseAdmin,
        checkoutSession: session,
        merchantOid: attempt.provider_attempt_id,
        callerIp: 'reconcile_job',
        userAgent: 'reconcile_job',
      });

      if (!result.ok) {
        await supabaseAdmin
          .from('payment_attempts')
          .update({
            error_message: `reconcile_failed: ${result.error}`,
            updated_at: nowIso,
          })
          .eq('id', attempt.id);
        continue;
      }

      await supabaseAdmin
        .from('checkout_sessions')
        .update({
          status: 'completed',
          order_id: result.order.id,
          order_number: result.order.order_number,
          updated_at: nowIso,
        })
        .eq('id', session.id);

      await supabaseAdmin.from('order_events').insert({
        order_id: result.order.id,
        status: 'payment_reconciled',
        description: 'Ödeme daha önce tahsil edildi; sipariş reconciliation ile tamamlandı.',
      });

      recovered += 1;
    }

    return NextResponse.json({ success: true, recovered, skipped, scanned: (sessions || []).length });
  } catch (err) {
    console.error('paytr reconcile error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
