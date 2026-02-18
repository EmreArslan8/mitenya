import { createClient } from '@supabase/supabase-js';
import { createOrderFromCheckoutSession } from '@/lib/orders/createOrderFromCheckoutSession';
import { beginWebhookInbox, markWebhookInbox } from '@/lib/payments/paytr/webhookInbox';
import {
  canMoveSessionToFinalizing,
  isAttemptSuccess,
  shouldResetSessionToActive,
} from '@/lib/payments/paytr/stateMachine';
import type { ProcessPaytrCallbackInput } from '@/lib/payments/paytr/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function processPaytrCallback(input: ProcessPaytrCallbackInput) {
  const { payload, callerIp, userAgent } = input;
  const {
    merchantOid,
    status,
    totalAmount,
    failedReasonCode,
    failedReasonMsg,
    paymentType,
    currency,
    rawPayload,
  } = payload;

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
  const nowIso = new Date().toISOString();

  const inbox = await beginWebhookInbox({
    supabase,
    provider: 'paytr',
    providerAttemptId: merchantOid,
    eventType: status,
    totalAmount,
    payload: rawPayload,
  });

  if (inbox.errorMessage) {
    throw new Error(`paytr webhook inbox error: ${inbox.errorMessage}`);
  }

  if (inbox.alreadyProcessed) return;

  const amountKurus = parseInt(totalAmount, 10);
  if (!Number.isFinite(amountKurus) || amountKurus <= 0) {
    await markWebhookInbox({
      supabase,
      inboxId: inbox.inboxId,
      status: 'failed',
      errorMessage: 'invalid total_amount',
    });
    return;
  }

  const { data: attempt } = await supabase
    .from('payment_attempts')
    .select('*')
    .eq('provider', 'paytr')
    .eq('provider_attempt_id', merchantOid)
    .single();

  if (!attempt) {
    let { data: legacyOrder } = await supabase
      .from('orders')
      .select('id, order_number, payment_status, status')
      .or(`order_number.eq.${merchantOid},id.eq.${merchantOid}`)
      .single();

    if (!legacyOrder) {
      const byMeta = await supabase
        .from('orders')
        .select('id, order_number, payment_status, status')
        .eq('metadata->>paytr_merchant_oid', merchantOid)
        .single();
      legacyOrder = byMeta.data ?? null;
    }

    if (!legacyOrder) {
      await markWebhookInbox({
        supabase,
        inboxId: inbox.inboxId,
        status: 'failed',
        errorMessage: 'payment_attempt/order bulunamadi',
      });
      return;
    }

    if (legacyOrder.payment_status === 'paid') {
      await markWebhookInbox({ supabase, inboxId: inbox.inboxId, status: 'processed' });
      return;
    }

    if (status === 'success') {
      const { error: legacyOrderPaidError } = await supabase
        .from('orders')
        .update({ payment_status: 'paid', status: 'processing', payment_id: merchantOid })
        .eq('id', legacyOrder.id)
        .select('id');

      if (legacyOrderPaidError) {
        await markWebhookInbox({
          supabase,
          inboxId: inbox.inboxId,
          status: 'failed',
          errorMessage: `legacy order payment update failed: ${legacyOrderPaidError.message}`,
        });
        return;
      }

      const { error: legacyEventError } = await supabase.from('order_events').insert({
        order_id: legacyOrder.id,
        status: 'payment_completed',
        description: `Ödeme başarıyla alındı. Tahsilat: ${(amountKurus / 100).toFixed(2)} ${
          currency || 'TL'
        } | payment_type: ${paymentType || '-'} | merchant_oid: ${merchantOid}`,
      });

      if (legacyEventError) {
        await markWebhookInbox({
          supabase,
          inboxId: inbox.inboxId,
          status: 'failed',
          errorMessage: `legacy order event insert failed: ${legacyEventError.message}`,
        });
        return;
      }
    } else {
      const { error: legacyOrderFailedError } = await supabase
        .from('orders')
        .update({ payment_status: 'failed', status: 'cancelled' })
        .eq('id', legacyOrder.id)
        .select('id');

      if (legacyOrderFailedError) {
        await markWebhookInbox({
          supabase,
          inboxId: inbox.inboxId,
          status: 'failed',
          errorMessage: `legacy order fail update failed: ${legacyOrderFailedError.message}`,
        });
        return;
      }

      const { error: legacyFailEventError } = await supabase.from('order_events').insert({
        order_id: legacyOrder.id,
        status: 'payment_failed',
        description: `Ödeme başarısız oldu. code=${failedReasonCode || '-'} msg=${
          failedReasonMsg || '-'
        } | total_amount=${totalAmount || '-'}`,
      });

      if (legacyFailEventError) {
        await markWebhookInbox({
          supabase,
          inboxId: inbox.inboxId,
          status: 'failed',
          errorMessage: `legacy fail event insert failed: ${legacyFailEventError.message}`,
        });
        return;
      }
    }

    await markWebhookInbox({ supabase, inboxId: inbox.inboxId, status: 'processed' });
    return;
  }

  if (isAttemptSuccess(attempt.status)) {
    await markWebhookInbox({ supabase, inboxId: inbox.inboxId, status: 'processed' });
    return;
  }

  const { data: checkoutSession } = await supabase
    .from('checkout_sessions')
    .select('*')
    .eq('id', attempt.checkout_session_id)
    .single();

  if (!checkoutSession) {
    await markWebhookInbox({
      supabase,
      inboxId: inbox.inboxId,
      status: 'failed',
      errorMessage: 'checkout_session bulunamadi',
    });
    return;
  }

  if (status === 'success') {
    const expectedAmountKurus = Math.round(Number(attempt.amount || 0) * 100);
    if (!Number.isFinite(expectedAmountKurus) || expectedAmountKurus !== amountKurus) {
      const { error: mismatchUpdateError } = await supabase
        .from('payment_attempts')
        .update({
          status: 'failed',
          error_message: `amount_mismatch expected=${expectedAmountKurus} actual=${amountKurus}`,
          updated_at: nowIso,
          raw_payload: rawPayload,
        })
        .eq('id', attempt.id)
        .neq('status', 'success')
        .select('id');

      await markWebhookInbox({
        supabase,
        inboxId: inbox.inboxId,
        status: 'failed',
        errorMessage: mismatchUpdateError
          ? `amount mismatch update failed: ${mismatchUpdateError.message}`
          : 'amount mismatch',
      });
      return;
    }

    if (checkoutSession.order_id || checkoutSession.status === 'completed') {
      const { error: finalizeExistingAttemptError } = await supabase
        .from('payment_attempts')
        .update({ status: 'success', updated_at: nowIso, raw_payload: rawPayload })
        .eq('id', attempt.id)
        .select('id');

      if (finalizeExistingAttemptError) {
        await markWebhookInbox({
          supabase,
          inboxId: inbox.inboxId,
          status: 'failed',
          errorMessage: `payment attempt finalize failed: ${finalizeExistingAttemptError.message}`,
        });
        return;
      }
      await markWebhookInbox({ supabase, inboxId: inbox.inboxId, status: 'processed' });
      return;
    }

    if (!canMoveSessionToFinalizing(checkoutSession.status)) {
      const { data: latestSession } = await supabase
        .from('checkout_sessions')
        .select('id, status, order_id')
        .eq('id', checkoutSession.id)
        .single();

      if (latestSession?.order_id || latestSession?.status === 'completed' || latestSession?.status === 'finalizing') {
        await markWebhookInbox({ supabase, inboxId: inbox.inboxId, status: 'processed' });
        return;
      }

      await markWebhookInbox({
        supabase,
        inboxId: inbox.inboxId,
        status: 'failed',
        errorMessage: 'checkout session invalid status for claim',
      });
      return;
    }

    const { data: claimedRows, error: claimSessionError } = await supabase
      .from('checkout_sessions')
      .update({ status: 'finalizing', updated_at: nowIso })
      .eq('id', checkoutSession.id)
      .is('order_id', null)
      .in('status', ['active', 'payment_initiated', 'expired', 'abandoned'])
      .select('id');

    if (claimSessionError) {
      await markWebhookInbox({
        supabase,
        inboxId: inbox.inboxId,
        status: 'failed',
        errorMessage: `checkout session claim update failed: ${claimSessionError.message}`,
      });
      return;
    }

    if (!claimedRows?.length) {
      const { data: latestSession } = await supabase
        .from('checkout_sessions')
        .select('id, status, order_id')
        .eq('id', checkoutSession.id)
        .single();

      if (latestSession?.order_id || latestSession?.status === 'completed' || latestSession?.status === 'finalizing') {
        await markWebhookInbox({ supabase, inboxId: inbox.inboxId, status: 'processed' });
        return;
      }

      await markWebhookInbox({
        supabase,
        inboxId: inbox.inboxId,
        status: 'failed',
        errorMessage: 'checkout session claim failed',
      });
      return;
    }

    const result = await createOrderFromCheckoutSession({
      supabase,
      checkoutSession,
      merchantOid,
      callerIp,
      userAgent,
    });

    if (!result.ok) {
      const { error: capturedNoOrderError } = await supabase
        .from('payment_attempts')
        .update({
          status: 'success',
          error_message: `payment_captured_order_create_failed: ${result.error}`,
          updated_at: nowIso,
          raw_payload: rawPayload,
        })
        .eq('id', attempt.id)
        .select('id');

      if (capturedNoOrderError) {
        await markWebhookInbox({
          supabase,
          inboxId: inbox.inboxId,
          status: 'failed',
          errorMessage: `attempt success write failed after order create error: ${capturedNoOrderError.message}`,
        });
        return;
      }

      await markWebhookInbox({
        supabase,
        inboxId: inbox.inboxId,
        status: 'failed',
        errorMessage: result.error,
      });
      return;
    }

    const { error: successAttemptUpdateError } = await supabase
      .from('payment_attempts')
      .update({ status: 'success', updated_at: nowIso, raw_payload: rawPayload })
      .eq('id', attempt.id)
      .select('id');

    if (successAttemptUpdateError) {
      await markWebhookInbox({
        supabase,
        inboxId: inbox.inboxId,
        status: 'failed',
        errorMessage: `payment attempt success update failed: ${successAttemptUpdateError.message}`,
      });
      return;
    }

    const { error: completeSessionError } = await supabase
      .from('checkout_sessions')
      .update({
        status: 'completed',
        order_id: result.order.id,
        order_number: result.order.order_number,
        updated_at: nowIso,
      })
      .eq('id', checkoutSession.id)
      .select('id');

    if (completeSessionError) {
      await markWebhookInbox({
        supabase,
        inboxId: inbox.inboxId,
        status: 'failed',
        errorMessage: `checkout session complete update failed: ${completeSessionError.message}`,
      });
      return;
    }

    const { error: paymentCompletedEventError } = await supabase.from('order_events').insert({
      order_id: result.order.id,
      status: result.isLateSuccess ? 'payment_completed_late' : 'payment_completed',
      description: `Ödeme başarıyla alındı. Tahsilat: ${(amountKurus / 100).toFixed(2)} ${
        currency || 'TL'
      } | payment_type: ${paymentType || '-'} | merchant_oid: ${merchantOid}`,
    });

    if (paymentCompletedEventError) {
      await markWebhookInbox({
        supabase,
        inboxId: inbox.inboxId,
        status: 'failed',
        errorMessage: `payment completed event insert failed: ${paymentCompletedEventError.message}`,
      });
      return;
    }

    await markWebhookInbox({ supabase, inboxId: inbox.inboxId, status: 'processed' });
    return;
  }

  const { error: failedAttemptUpdateError } = await supabase
    .from('payment_attempts')
    .update({
      status: 'failed',
      error_code: failedReasonCode || null,
      error_message: failedReasonMsg || 'PayTR failure',
      updated_at: nowIso,
      raw_payload: rawPayload,
    })
    .eq('id', attempt.id)
    .neq('status', 'success')
    .select('id');

  if (failedAttemptUpdateError) {
    await markWebhookInbox({
      supabase,
      inboxId: inbox.inboxId,
      status: 'failed',
      errorMessage: `payment attempt fail update failed: ${failedAttemptUpdateError.message}`,
    });
    return;
  }

  if (shouldResetSessionToActive(checkoutSession.status)) {
    const { error: resetSessionError } = await supabase
      .from('checkout_sessions')
      .update({ status: 'active', updated_at: nowIso })
      .eq('id', checkoutSession.id)
      .neq('status', 'completed')
      .select('id');

    if (resetSessionError) {
      await markWebhookInbox({
        supabase,
        inboxId: inbox.inboxId,
        status: 'failed',
        errorMessage: `checkout session reset failed: ${resetSessionError.message}`,
      });
      return;
    }
  }

  await markWebhookInbox({ supabase, inboxId: inbox.inboxId, status: 'processed' });
}
