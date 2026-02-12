import { ApiErrors, createSuccessResponse } from '@/lib/api/errors';
import { getClientIp } from '@/lib/api/getClientIp';
import { rateLimit } from '@/lib/api/rateLimit';
import { createSupabaseServer } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const createStockAlertSchema = z.object({
  productId: z.string().trim().min(1),
  productName: z.string().trim().max(300).optional(),
  productUrl: z.string().trim().url().max(2048).optional(),
  variantName: z.string().trim().max(120).optional(),
  variantValue: z.string().trim().max(120).optional(),
});

type StockAlertRow = {
  id: string;
  status: 'pending' | 'sent' | 'unsubscribed';
};

export async function POST(req: NextRequest) {
  try {
    const userIp = getClientIp(req);
    if (!(await rateLimit(`stock_alerts_post:${userIp}`))) {
      return ApiErrors.rateLimited();
    }

    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    if (!user.email) {
      return ApiErrors.badRequest('Kullanıcı e-posta bilgisi bulunamadı');
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return ApiErrors.badRequest('Invalid JSON');
    }

    const parsed = createStockAlertSchema.safeParse(body);
    if (!parsed.success) {
      return ApiErrors.validationError(parsed.error.issues);
    }

    const payload = {
      user_id: user.id,
      email: user.email.toLowerCase(),
      product_id: parsed.data.productId,
      product_name: parsed.data.productName ?? null,
      product_url: parsed.data.productUrl ?? null,
      variant_name: parsed.data.variantName ?? '',
      variant_value: parsed.data.variantValue ?? '',
      status: 'pending' as const,
      sent_at: null,
      last_error: null,
    };

    const { data, error } = await supabase
      .from('stock_alert_subscriptions')
      .upsert(payload, { onConflict: 'product_id,variant_name,variant_value,email' })
      .select('id, status')
      .single();

    if (error) {
      console.error('API /stock-alerts POST error:', error);
      return ApiErrors.internalError('Stok bildirimi kaydedilemedi');
    }

    return createSuccessResponse(
      {
        subscriptionId: (data as StockAlertRow).id,
        status: (data as StockAlertRow).status,
      },
      201
    );
  } catch (error) {
    console.error('API /stock-alerts POST error:', error);
    return ApiErrors.internalError('Stok bildirimi kaydedilemedi');
  }
}
