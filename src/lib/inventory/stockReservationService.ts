import type { SupabaseClient } from '@supabase/supabase-js';

export type ReservationItemInput = {
  product_id: string;
  quantity: number;
};

export type ReservationRpcResult = {
  ok: boolean;
  code: string;
  message: string | null;
  details: unknown;
};

const DEFAULT_ERROR_CODE = 'inventory_rpc_error';

const toResult = (input: unknown, fallbackCode: string): ReservationRpcResult => {
  const row = Array.isArray(input) ? input[0] : input;
  if (!row || typeof row !== 'object') {
    return {
      ok: false,
      code: fallbackCode,
      message: 'Inventory RPC returned an invalid payload',
      details: input,
    };
  }

  const payload = row as {
    ok?: unknown;
    code?: unknown;
    message?: unknown;
    details?: unknown;
  };

  return {
    ok: Boolean(payload.ok),
    code: String(payload.code ?? fallbackCode),
    message: payload.message == null ? null : String(payload.message),
    details: payload.details ?? null,
  };
};

const toErrorResult = (error: { code?: string; message?: string } | null): ReservationRpcResult => ({
  ok: false,
  code: error?.code || DEFAULT_ERROR_CODE,
  message: error?.message || 'Inventory RPC failed',
  details: null,
});

export const isInventoryNoopCode = (code: string | null | undefined) => {
  const normalized = String(code || '').toLowerCase();
  return (
    normalized === 'not_found' ||
    normalized === 'already_released' ||
    normalized === 'already_consumed' ||
    normalized === 'already_finalized'
  );
};

export async function reserveCheckoutStock(
  supabase: SupabaseClient,
  params: {
    checkoutSessionId: string;
    items: ReservationItemInput[];
    expiresAt: string;
  }
): Promise<ReservationRpcResult> {
  const { data, error } = await supabase.rpc('reserve_checkout_stock', {
    p_checkout_session_id: params.checkoutSessionId,
    p_items: params.items,
    p_expires_at: params.expiresAt,
  });

  if (error) return toErrorResult(error);
  return toResult(data, 'reserve_failed');
}

export async function finalizeCheckoutStock(
  supabase: SupabaseClient,
  params: {
    checkoutSessionId: string;
    orderId: string;
    idempotencyKey: string;
  }
): Promise<ReservationRpcResult> {
  const { data, error } = await supabase.rpc('finalize_checkout_stock', {
    p_checkout_session_id: params.checkoutSessionId,
    p_order_id: params.orderId,
    p_idempotency_key: params.idempotencyKey,
  });

  if (error) return toErrorResult(error);
  return toResult(data, 'finalize_failed');
}

export async function releaseCheckoutStock(
  supabase: SupabaseClient,
  params: {
    checkoutSessionId: string;
    reason: string;
  }
): Promise<ReservationRpcResult> {
  const { data, error } = await supabase.rpc('release_checkout_stock', {
    p_checkout_session_id: params.checkoutSessionId,
    p_reason: params.reason,
  });

  if (error) return toErrorResult(error);
  return toResult(data, 'release_failed');
}

export async function releaseCheckoutStockBulk(
  supabase: SupabaseClient,
  params: {
    checkoutSessionIds: string[];
    reason: string;
  }
): Promise<{ ok: boolean; releasedCount: number; errorCode?: string; errorMessage?: string }> {
  const { data, error } = await supabase.rpc('release_checkout_stock_bulk', {
    p_checkout_session_ids: params.checkoutSessionIds,
    p_reason: params.reason,
  });

  if (error) {
    return {
      ok: false,
      releasedCount: 0,
      errorCode: error.code || DEFAULT_ERROR_CODE,
      errorMessage: error.message || 'Bulk inventory release failed',
    };
  }

  const rows = Array.isArray(data) ? data : [];
  const releasedCount = rows.filter((row) => {
    if (!row || typeof row !== 'object') return false;
    return Boolean((row as { ok?: unknown }).ok);
  }).length;

  return { ok: true, releasedCount };
}
