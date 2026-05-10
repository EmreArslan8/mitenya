import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';

const DOC_TYPES = new Set(['pre_info', 'distance_sale']);

const DOC_LABELS: Record<string, string> = {
  pre_info: 'Ön Bilgilendirme Formu',
  distance_sale: 'Mesafeli Satış Sözleşmesi',
};

export async function GET(req: NextRequest) {
  const caller = getClientIp(req);
  if (!(await rateLimit(`order_doc:${caller}`, { max: 30 }))) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get('t')?.trim();
  const docType = searchParams.get('doc')?.trim();

  if (!token || token.length < 32 || token.length > 128) {
    return new NextResponse('Belge bulunamadı', { status: 404 });
  }

  if (!docType || !DOC_TYPES.has(docType)) {
    return new NextResponse('Geçersiz belge türü', { status: 400 });
  }

  // Token ile siparişi bul
  let { data: order } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('guest_tracking_token', token)
    .maybeSingle();

  if (!order) {
    const fallback = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('metadata->>guest_tracking_token', token)
      .maybeSingle();
    order = fallback.data;
  }

  if (!order) {
    return new NextResponse('Belge bulunamadı', { status: 404 });
  }

  // Belgeyi getir
  const { data: doc } = await supabaseAdmin
    .from('order_documents')
    .select('content_html, doc_type')
    .eq('order_id', order.id)
    .eq('doc_type', docType)
    .maybeSingle();

  if (!doc?.content_html) {
    return new NextResponse('Belge bulunamadı', { status: 404 });
  }

  const label = DOC_LABELS[docType] ?? 'Belge';
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${label}</title>
  <style>
    body { margin: 0; padding: 32px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9f9f9; color: #111; }
    .wrapper { max-width: 760px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 40px 48px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .brand { font-size: 12px; font-weight: 800; letter-spacing: 4px; color: #C1121F; text-transform: uppercase; margin-bottom: 24px; }
    @media print { body { background: #fff; padding: 0; } .wrapper { box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="brand">MITENYA</div>
    ${doc.content_html}
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'private, no-store',
    },
  });
}

export const dynamic = 'force-dynamic';
