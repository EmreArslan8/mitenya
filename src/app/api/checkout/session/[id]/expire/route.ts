import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateSameOrigin, validateCsrfToken } from '@/lib/api/security';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { isInventoryNoopCode, releaseCheckoutStock } from '@/lib/inventory/stockReservationService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const csrfError = validateSameOrigin(req);
    if (csrfError) return csrfError;
    const csrfTokenError = validateCsrfToken(req);
    if (csrfTokenError) return csrfTokenError;

    const userIp = getClientIp(req);
    if (!(await rateLimit(`checkout_session_expire:${userIp}`))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { data: session, error } = await supabaseAdmin
      .from('checkout_sessions')
      .select('id, user_id, user_email, status')
      .eq('id', id)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: 'Checkout session bulunamadı' }, { status: 404 });
    }

    const isOwner =
      session.user_id === user.id ||
      (!!session.user_email &&
        !!user.email &&
        String(session.user_email).toLowerCase() === String(user.email).toLowerCase());

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session.status === 'completed') {
      return NextResponse.json({ success: true, status: 'completed' });
    }

    const releaseResult = await releaseCheckoutStock(supabaseAdmin, {
      checkoutSessionId: id,
      reason: 'session_abandoned_by_user',
    });

    if (!releaseResult.ok && !isInventoryNoopCode(releaseResult.code)) {
      return NextResponse.json(
        {
          error: releaseResult.message || 'Stok rezervasyonu serbest bırakılamadı',
          code: releaseResult.code,
        },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('checkout_sessions')
      .update({ status: 'abandoned', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Checkout session güncellenemedi' }, { status: 500 });
    }

    await supabaseAdmin
      .from('payment_attempts')
      .update({
        status: 'cancelled',
        error_message: 'User abandoned payment session',
        updated_at: new Date().toISOString(),
      })
      .eq('checkout_session_id', id)
      .eq('status', 'initiated');

    return NextResponse.json({ success: true, status: 'abandoned' });
  } catch (err) {
    console.error('checkout session expire error', err);
    return NextResponse.json({ error: 'Sunucu hatası oluştu' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
