import 'server-only';
import crypto from 'node:crypto';

const algorithm = 'aes-256-ecb';
const key = Buffer.from('0e0c70f133cc359baf5d76590df67610511be1346b33568915cc11f6a4063ca0', 'hex');

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, '');
  let encrypted = cipher.update(text, 'utf-8', 'base64');
  encrypted += cipher.final('base64');
  return encodeURIComponent(encrypted);
}

export function decrypt(encryptedText: string): string {
  const decipher = crypto.createDecipheriv(algorithm, key, '');
  let decrypted = decipher.update(decodeURIComponent(encryptedText), 'base64', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

export const encryptNum = (value: number | string) => {
  const num = typeof value === 'number' ? value : parseInt(value);
  return (num + 10) * 2 - 3;
};

export const decryptNum = (value: number | string) => {
  const num = typeof value === 'number' ? value : parseInt(value);
  return (num + 3) / 2 - 10;
};
