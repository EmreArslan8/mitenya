import { ApiErrors, createSuccessResponse } from '@/lib/api/errors';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextRequest } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const dispatchSchema = z.object({
  productId: z.string().trim().min(1),
  productName: z.string().trim().max(300).optional(),
  productUrl: z.string().trim().url().max(2048).optional(),
  stock: z.number().int().optional(),
});

type StockAlertSubscription = {
  id: string;
  email: string;
  product_id: string;
  product_name: string | null;
  product_url: string | null;
};

const sendResendEmail = async ({
  apiKey,
  from,
  to,
  subject,
  html,
}: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const reason = await res.text();
    throw new Error(reason || 'Unknown mail provider error');
  }
};

const buildHtml = (productName: string, productUrl: string) => {
  const escapedName = productName.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapedUrl = productUrl.replace(/"/g, '&quot;');

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111">
      <h2 style="margin:0 0 12px">Beklediginiz urun yeniden stokta</h2>
      <p style="margin:0 0 12px"><strong>${escapedName}</strong> tekrar stokta.</p>
      <p style="margin:0 0 18px">Urunu tukenmeden incelemek icin asagidaki butona tiklayin.</p>
      <a href="${escapedUrl}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:#111;color:#fff;text-decoration:none;font-weight:600">
        Urunu gor
      </a>
      <p style="margin:18px 0 0;color:#666;font-size:13px">
        Bu e-postayi, stok bildirimi talebiniz oldugu icin gonderdik.
      </p>
    </div>
  `.trim();
};

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.STOCK_ALERT_CRON_SECRET;
    const headerSecret = req.headers.get('x-stock-alert-secret');

    if (!secret || headerSecret !== secret) {
      return ApiErrors.forbidden();
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return ApiErrors.badRequest('Invalid JSON');
    }

    const parsed = dispatchSchema.safeParse(body);
    if (!parsed.success) {
      return ApiErrors.validationError(parsed.error.issues);
    }

    if (typeof parsed.data.stock === 'number' && parsed.data.stock <= 0) {
      return createSuccessResponse({ sent: 0, skipped: 0, failed: 0 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.STOCK_ALERT_FROM_EMAIL;
    const baseUrl = process.env.NEXT_PUBLIC_HOST_URL?.replace(/\/$/, '');

    if (!resendApiKey || !fromEmail) {
      return ApiErrors.internalError('Missing mail provider configuration');
    }

    const { data, error } = await supabaseAdmin
      .from('stock_alert_subscriptions')
      .select('id, email, product_id, product_name, product_url')
      .eq('product_id', parsed.data.productId)
      .eq('status', 'pending');

    if (error) {
      console.error('API /stock-alerts/dispatch query error:', error);
      return ApiErrors.internalError('Failed to load stock alert subscriptions');
    }

    const subscriptions = (data ?? []) as StockAlertSubscription[];
    if (!subscriptions.length) {
      return createSuccessResponse({ sent: 0, skipped: 0, failed: 0 });
    }

    const productName = parsed.data.productName ?? subscriptions[0]?.product_name ?? 'Urun';
    const productUrl =
      parsed.data.productUrl ??
      subscriptions[0]?.product_url ??
      (baseUrl ? `${baseUrl}/product/${encodeURIComponent(parsed.data.productId)}` : '');

    if (!productUrl) {
      return ApiErrors.internalError('Product URL is required for dispatch');
    }

    const subject = `${productName} yeniden stokta`;
    const html = buildHtml(productName, productUrl);

    const outcomes = await Promise.allSettled(
      subscriptions.map((sub) =>
        sendResendEmail({
          apiKey: resendApiKey,
          from: fromEmail,
          to: sub.email,
          subject,
          html,
        }).then(() => sub.id)
      )
    );

    const sentIds: string[] = [];
    let failed = 0;

    for (const outcome of outcomes) {
      if (outcome.status === 'fulfilled') {
        sentIds.push(outcome.value);
      } else {
        failed += 1;
      }
    }

    if (sentIds.length) {
      const { error: updateError } = await supabaseAdmin
        .from('stock_alert_subscriptions')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          last_error: null,
        })
        .in('id', sentIds);

      if (updateError) {
        console.error('API /stock-alerts/dispatch update error:', updateError);
        return ApiErrors.internalError('Failed to update sent stock alert subscriptions');
      }
    }

    return createSuccessResponse({
      sent: sentIds.length,
      skipped: 0,
      failed,
    });
  } catch (error) {
    console.error('API /stock-alerts/dispatch error:', error);
    return ApiErrors.internalError('Stock alert dispatch failed');
  }
}
