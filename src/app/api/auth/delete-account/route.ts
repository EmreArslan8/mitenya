import { createClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { validateSameOrigin, validateCsrfToken } from '@/lib/api/security';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  currentPassword: z.string().min(1),
});

export async function DELETE(req: NextRequest) {
  const sameOriginError = validateSameOrigin(req);
  if (sameOriginError) return sameOriginError;

  const csrfError = validateCsrfToken(req);
  if (csrfError) return csrfError;

  const ip = getClientIp(req);
  const allowed = await rateLimit(`delete_account_ip:${ip}`, { windowMs: 15 * 60_000, max: 3 });
  if (!allowed) {
    return NextResponse.json({ error: 'Çok fazla deneme. Lütfen bekleyin.' }, { status: 429 });
  }

  const supabase = await createSupabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Şifre gereklidir.' }, { status: 400 });
  }

  // Şifre doğrulama (cookie'siz ayrı client)
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { error: verifyError } = await anonClient.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (verifyError) {
    return NextResponse.json({ error: 'Şifreniz yanlış.' }, { status: 401 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json({ error: 'Hesap silinemedi.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
