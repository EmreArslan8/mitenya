import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { z } from 'zod';

const trackSchema = z.object({
  code: z.string().min(3).max(20).regex(/^[A-Z0-9_-]+$/i),
  refererUrl: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userIp = getClientIp(req);
    if (!(await rateLimit(`affiliate_track:${userIp}`))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = trackSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const { code, refererUrl } = validation.data;

    const { data: affiliate } = await supabaseAdmin
      .from('affiliates')
      .select('id')
      .eq('code', code.toUpperCase())
      .eq('status', 'active')
      .maybeSingle();

    if (!affiliate) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    const { data: click, error: clickError } = await supabaseAdmin
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliate.id,
        ip_address: userIp,
        user_agent: req.headers.get('user-agent') ?? null,
        referer_url: refererUrl ?? null,
        converted: false,
      })
      .select('id')
      .single();

    if (clickError || !click) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true, clickId: click.id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
