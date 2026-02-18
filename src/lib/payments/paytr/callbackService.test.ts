import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  createClientMock,
  beginWebhookInboxMock,
  markWebhookInboxMock,
  createOrderFromCheckoutSessionMock,
} = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  beginWebhookInboxMock: vi.fn(),
  markWebhookInboxMock: vi.fn(),
  createOrderFromCheckoutSessionMock: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));

vi.mock('@/lib/payments/paytr/webhookInbox', () => ({
  beginWebhookInbox: beginWebhookInboxMock,
  markWebhookInbox: markWebhookInboxMock,
}));

vi.mock('@/lib/orders/createOrderFromCheckoutSession', () => ({
  createOrderFromCheckoutSession: createOrderFromCheckoutSessionMock,
}));

import { processPaytrCallback } from './callbackService';

type Script = {
  single?: Record<string, Array<{ data: unknown; error?: unknown }>>;
  updateSelect?: Record<string, Array<{ data: unknown; error?: unknown }>>;
  insert?: Record<string, Array<{ data: unknown; error?: unknown }>>;
};

function shiftResult<T>(arr?: T[]): T | undefined {
  if (!arr || arr.length === 0) return undefined;
  return arr.shift();
}

function makeSupabaseMock(script: Script = {}) {
  const calls: {
    updates: Record<string, unknown[]>;
    inserts: Record<string, unknown[]>;
  } = {
    updates: {},
    inserts: {},
  };

  const from = vi.fn((table: string) => {
    const state: { mode: 'update' | 'select' | null } = { mode: null };
    const qb: Record<string, unknown> = {};

    qb.select = vi.fn(() => {
      if (state.mode === 'update') {
        return Promise.resolve(shiftResult(script.updateSelect?.[table]) ?? { data: null, error: null });
      }
      state.mode = 'select';
      return qb;
    });

    qb.update = vi.fn((values: unknown) => {
      state.mode = 'update';
      calls.updates[table] = calls.updates[table] || [];
      calls.updates[table].push(values);
      return qb;
    });

    qb.insert = vi.fn((values: unknown) => {
      calls.inserts[table] = calls.inserts[table] || [];
      calls.inserts[table].push(values);
      return Promise.resolve(shiftResult(script.insert?.[table]) ?? { data: null, error: null });
    });

    qb.eq = vi.fn(() => qb);
    qb.or = vi.fn(() => qb);
    qb.is = vi.fn(() => qb);
    qb.in = vi.fn(() => qb);
    qb.neq = vi.fn(() => qb);

    qb.single = vi.fn(() => {
      return Promise.resolve(shiftResult(script.single?.[table]) ?? { data: null, error: null });
    });

    return qb;
  });

  return { client: { from }, calls, from };
}

const basePayload = {
  merchantOid: 'M123',
  status: 'success',
  totalAmount: '1000',
  failedReasonCode: '',
  failedReasonMsg: '',
  paymentType: 'card',
  currency: 'TL',
  rawPayload: { merchant_oid: 'M123', status: 'success', total_amount: '1000' },
};

describe('processPaytrCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    beginWebhookInboxMock.mockResolvedValue({ inboxId: 'inbox_1', alreadyProcessed: false });
    markWebhookInboxMock.mockResolvedValue(undefined);
  });

  it('returns early when webhook inbox says already processed', async () => {
    const supabase = makeSupabaseMock();
    createClientMock.mockReturnValue(supabase.client);
    beginWebhookInboxMock.mockResolvedValue({ inboxId: 'inbox_1', alreadyProcessed: true });

    await processPaytrCallback({
      payload: basePayload,
      callerIp: '1.1.1.1',
      userAgent: 'ua',
    });

    expect(supabase.from).not.toHaveBeenCalled();
    expect(markWebhookInboxMock).not.toHaveBeenCalled();
  });

  it('does not downgrade a successful payment attempt', async () => {
    const supabase = makeSupabaseMock({
      single: {
        payment_attempts: [{ data: { id: 'a1', status: 'success' }, error: null }],
      },
    });
    createClientMock.mockReturnValue(supabase.client);

    await processPaytrCallback({
      payload: { ...basePayload, status: 'failed', failedReasonCode: '99', failedReasonMsg: 'x' },
      callerIp: '1.1.1.1',
      userAgent: 'ua',
    });

    expect(markWebhookInboxMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'processed', inboxId: 'inbox_1' })
    );
    expect(supabase.calls.updates.payment_attempts).toBeUndefined();
  });

  it('completes success flow: claim, create order, mark session completed', async () => {
    const supabase = makeSupabaseMock({
      single: {
        payment_attempts: [
          { data: { id: 'a1', status: 'initiated', checkout_session_id: 'cs1', amount: 10 }, error: null },
        ],
        checkout_sessions: [{ data: { id: 'cs1', status: 'active', order_id: null }, error: null }],
      },
      updateSelect: {
        checkout_sessions: [{ data: [{ id: 'cs1' }], error: null }],
      },
    });
    createClientMock.mockReturnValue(supabase.client);
    createOrderFromCheckoutSessionMock.mockResolvedValue({
      ok: true,
      order: { id: 'o1', order_number: 'ORD-1' },
      isLateSuccess: false,
    });

    await processPaytrCallback({
      payload: basePayload,
      callerIp: '1.1.1.1',
      userAgent: 'ua',
    });

    expect(createOrderFromCheckoutSessionMock).toHaveBeenCalledOnce();
    expect(supabase.calls.updates.payment_attempts).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'success' })])
    );
    expect(supabase.calls.updates.checkout_sessions).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'finalizing' }), expect.objectContaining({ status: 'completed' })])
    );
    expect(supabase.calls.inserts.order_events?.length).toBe(1);
    expect(markWebhookInboxMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'processed', inboxId: 'inbox_1' })
    );
  });

  it('keeps attempt success when payment captured but order creation fails', async () => {
    const supabase = makeSupabaseMock({
      single: {
        payment_attempts: [
          { data: { id: 'a1', status: 'initiated', checkout_session_id: 'cs1', amount: 10 }, error: null },
        ],
        checkout_sessions: [{ data: { id: 'cs1', status: 'active', order_id: null }, error: null }],
      },
      updateSelect: {
        checkout_sessions: [{ data: [{ id: 'cs1' }], error: null }],
      },
    });
    createClientMock.mockReturnValue(supabase.client);
    createOrderFromCheckoutSessionMock.mockResolvedValue({ ok: false, error: 'edge down' });

    await processPaytrCallback({
      payload: basePayload,
      callerIp: '1.1.1.1',
      userAgent: 'ua',
    });

    expect(supabase.calls.updates.payment_attempts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: 'success',
          error_message: expect.stringContaining('payment_captured_order_create_failed'),
        }),
      ])
    );
    expect(markWebhookInboxMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'failed', errorMessage: 'edge down' })
    );
  });

  it('fails webhook when callback amount does not match attempt amount', async () => {
    const supabase = makeSupabaseMock({
      single: {
        payment_attempts: [
          { data: { id: 'a1', status: 'initiated', checkout_session_id: 'cs1', amount: 20 }, error: null },
        ],
        checkout_sessions: [{ data: { id: 'cs1', status: 'active', order_id: null }, error: null }],
      },
    });
    createClientMock.mockReturnValue(supabase.client);

    await processPaytrCallback({
      payload: { ...basePayload, totalAmount: '1000' },
      callerIp: '1.1.1.1',
      userAgent: 'ua',
    });

    expect(createOrderFromCheckoutSessionMock).not.toHaveBeenCalled();
    expect(supabase.calls.updates.payment_attempts).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'failed' })])
    );
    expect(markWebhookInboxMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'failed', errorMessage: 'amount mismatch' })
    );
  });

  it('marks webhook failed when payment attempt success update fails', async () => {
    const supabase = makeSupabaseMock({
      single: {
        payment_attempts: [
          { data: { id: 'a1', status: 'initiated', checkout_session_id: 'cs1', amount: 10 }, error: null },
        ],
        checkout_sessions: [{ data: { id: 'cs1', status: 'active', order_id: null }, error: null }],
      },
      updateSelect: {
        checkout_sessions: [{ data: [{ id: 'cs1' }], error: null }],
        payment_attempts: [{ data: null, error: { message: 'db down' } }],
      },
    });
    createClientMock.mockReturnValue(supabase.client);
    createOrderFromCheckoutSessionMock.mockResolvedValue({
      ok: true,
      order: { id: 'o1', order_number: 'ORD-1' },
      isLateSuccess: false,
    });

    await processPaytrCallback({
      payload: basePayload,
      callerIp: '1.1.1.1',
      userAgent: 'ua',
    });

    expect(markWebhookInboxMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        errorMessage: expect.stringContaining('payment attempt success update failed'),
      })
    );
  });

  it('handles failed callback by marking attempt failed and resetting session to active', async () => {
    const supabase = makeSupabaseMock({
      single: {
        payment_attempts: [{ data: { id: 'a1', status: 'initiated', checkout_session_id: 'cs1' }, error: null }],
        checkout_sessions: [{ data: { id: 'cs1', status: 'payment_initiated', order_id: null }, error: null }],
      },
    });
    createClientMock.mockReturnValue(supabase.client);

    await processPaytrCallback({
      payload: {
        ...basePayload,
        status: 'failed',
        failedReasonCode: '12',
        failedReasonMsg: 'declined',
      },
      callerIp: '1.1.1.1',
      userAgent: 'ua',
    });

    expect(supabase.calls.updates.payment_attempts).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'failed', error_code: '12' })])
    );
    expect(supabase.calls.updates.checkout_sessions).toEqual(
      expect.arrayContaining([expect.objectContaining({ status: 'active' })])
    );
    expect(markWebhookInboxMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'processed', inboxId: 'inbox_1' })
    );
  });
});
