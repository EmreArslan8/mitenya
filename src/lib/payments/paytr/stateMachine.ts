export const TERMINAL_ATTEMPT_STATUSES = new Set(['success', 'failed', 'cancelled', 'timeout']);

export function isAttemptSuccess(status: string | null | undefined) {
  return String(status || '').toLowerCase() === 'success';
}

export function canMoveSessionToFinalizing(status: string | null | undefined) {
  return new Set(['active', 'payment_initiated', 'expired', 'abandoned']).has(
    String(status || '').toLowerCase()
  );
}

export function shouldResetSessionToActive(status: string | null | undefined) {
  const s = String(status || '').toLowerCase();
  return s !== 'completed' && s !== 'finalizing';
}
