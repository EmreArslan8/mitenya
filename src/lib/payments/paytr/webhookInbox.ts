import type { SupabaseClient } from '@supabase/supabase-js';

export async function beginWebhookInbox(params: {
  supabase: SupabaseClient;
  provider: 'paytr';
  providerAttemptId: string;
  eventType: string;
  totalAmount: string;
  payload: Record<string, string>;
}) {
  const { supabase, provider, providerAttemptId, eventType, totalAmount, payload } = params;

  let inboxId: string | null = null;

  const { data: insertedInbox, error: inboxInsertError } = await supabase
    .from('payment_webhook_inbox')
    .insert({
      provider,
      provider_attempt_id: providerAttemptId,
      event_type: eventType,
      total_amount: totalAmount,
      payload,
      processing_status: 'received',
    })
    .select('id, processing_status')
    .single();

  if (!inboxInsertError && insertedInbox) {
    inboxId = insertedInbox.id;
  }

  let alreadyProcessed = false;

  if (inboxInsertError?.code === '23505') {
    const { data: existingInbox } = await supabase
      .from('payment_webhook_inbox')
      .select('id, processing_status')
      .eq('provider', provider)
      .eq('provider_attempt_id', providerAttemptId)
      .eq('event_type', eventType)
      .eq('total_amount', totalAmount)
      .single();

    if (existingInbox?.processing_status === 'processed') {
      alreadyProcessed = true;
    }

    inboxId = existingInbox?.id ?? null;
  }

  if (inboxInsertError && inboxInsertError.code !== '23505') {
    return {
      inboxId: null,
      alreadyProcessed: false,
      errorMessage: inboxInsertError.message || 'payment_webhook_inbox insert failed',
    };
  }

  return { inboxId, alreadyProcessed, errorMessage: null };
}

export async function markWebhookInbox(params: {
  supabase: SupabaseClient;
  inboxId: string | null;
  status: 'processed' | 'failed';
  errorMessage?: string;
}) {
  const { supabase, inboxId, status, errorMessage } = params;
  if (!inboxId) return;

  await supabase
    .from('payment_webhook_inbox')
    .update({
      processing_status: status,
      error_message: errorMessage ?? null,
      processed_at: status === 'processed' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', inboxId);
}
