import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

    const { data: sessions, error: fetchError } = await supabaseAdmin
      .from('checkout_sessions')
      .select('id')
      .in('status', ['active', 'payment_initiated'])
      .lt('expires_at', nowIso)
      .limit(2000);

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch stale sessions' }, { status: 500 });
    }

    const sessionIds = (sessions || []).map((s) => s.id);
    if (!sessionIds.length) {
      return NextResponse.json({ success: true, expiredCount: 0 });
    }

    const { error: updateSessionError } = await supabaseAdmin
      .from('checkout_sessions')
      .update({ status: 'expired', updated_at: nowIso })
      .in('id', sessionIds)
      .in('status', ['active', 'payment_initiated']);

    if (updateSessionError) {
      return NextResponse.json({ error: 'Failed to expire sessions' }, { status: 500 });
    }

    await supabaseAdmin
      .from('payment_attempts')
      .update({ status: 'timeout', updated_at: nowIso })
      .in('checkout_session_id', sessionIds)
      .eq('status', 'initiated');

    return NextResponse.json({ success: true, expiredCount: sessionIds.length });
  } catch (err) {
    console.error('expire stale checkout sessions error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
