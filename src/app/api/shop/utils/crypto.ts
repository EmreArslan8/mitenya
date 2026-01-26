import 'server-only';
import * as crypto from 'crypto';

// Güvenli algoritma: AES-256-GCM (authenticated encryption)
const algorithm = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// Environment variable'dan key al
function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  return key;
}

export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(text, 'utf-8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Format: IV (16) + AuthTag (16) + EncryptedData
  const result = Buffer.concat([iv, authTag, encrypted]);
  return encodeURIComponent(result.toString('base64'));
}

export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const buffer = Buffer.from(decodeURIComponent(encryptedText), 'base64');

  // Extract IV, AuthTag, and encrypted data
  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf-8');
}

export const encryptNum = (value: number | string) => {
  const num = typeof value === 'number' ? value : parseInt(value);
  return (num + 10) * 2 - 3;
};

export const decryptNum = (value: number | string) => {
  const num = typeof value === 'number' ? value : parseInt(value);
  return (num + 3) / 2 - 10;
};
