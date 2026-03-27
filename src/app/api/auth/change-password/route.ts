import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createSupabaseServer } from '@/lib/supabase/server';
import { validateSameOrigin, validateCsrfToken } from '@/lib/api/security';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { validatePassword } from '@/lib/utils/password';
import { z } from 'zod';

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  const sameOriginError = validateSameOrigin(req);
  if (sameOriginError) return sameOriginError;

  const csrfError = validateCsrfToken(req);
  if (csrfError) return csrfError;

  const ip = getClientIp(req);
  const allowed = await rateLimit(`change_password_ip:${ip}`, { windowMs: 15 * 60_000, max: 5 });
  if (!allowed) {
    return NextResponse.json({ error: 'Çok fazla deneme. Lütfen bekleyin.' }, { status: 429 });
  }

  const supabase = await createSupabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.email) {
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
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  // Server-side şifre kuralı kontrolü
  const pwErr = validatePassword(newPassword);
  if (pwErr) {
    return NextResponse.json({ error: pwErr }, { status: 422 });
  }

  // Mevcut şifreyi doğrula (cookie'siz ayrı client ile — session'ı bozmaz)
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { error: verifyError } = await anonClient.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) {
    return NextResponse.json({ error: 'Mevcut şifreniz yanlış.' }, { status: 401 });
  }

  // Şifreyi güncelle
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return NextResponse.json({ error: 'Şifre güncellenemedi.' }, { status: 500 });
  }

  // Diğer oturumları kapat
  await supabase.auth.signOut({ scope: 'others' });

  return NextResponse.json({ ok: true });
}
