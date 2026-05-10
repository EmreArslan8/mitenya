import crypto from 'crypto';

export const GUEST_TRACKING_TOKEN_BYTES = 32;

export function createGuestTrackingToken() {
  return crypto.randomBytes(GUEST_TRACKING_TOKEN_BYTES).toString('base64url');
}

