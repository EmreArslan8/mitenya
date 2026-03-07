/**
 * Rate limiter (Upstash Redis varsa onu, yoksa memory fallback).
 * Prod için UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN verildiğinde paylaşımlı limit çalışır.
 * Aksi halde process-local memory kullanılır (serverless'ta kalıcı değildir).
 */
import { isUpstashEnabled, parseUpstashResult, runUpstashPipeline } from '@/lib/cache/upstashRedis';

const WINDOW_MS = 60_000; // 1 dakika
const MAX_REQUESTS = 60; // dakika başına 60 istek

const buckets = new Map<string, { count: number; expiresAt: number }>();

// Expired entry'leri periyodik olarak temizle (her 5 dakikada bir)
const CLEANUP_INTERVAL_MS = 5 * 60_000;
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (v.expiresAt < now) buckets.delete(k);
  }
}, CLEANUP_INTERVAL_MS).unref();

export const rateLimit = async (key: string): Promise<boolean> => {
  // Upstash Redis varsa onu kullan
  if (isUpstashEnabled()) {
    try {
      const result = await runUpstashPipeline([
        ['INCR', key],
        ['EXPIRE', key, Math.ceil(WINDOW_MS / 1000)],
      ]);
      const current = parseUpstashResult(result[0]);
      if (typeof current === 'number') {
        return current <= MAX_REQUESTS;
      }
      // Eğer yanıt beklenmedikse mem fallback'e düş
    } catch (err) {
      console.error('RateLimit Upstash fallback:', err);
      // aşağıda mem fallback
    }
  }

  // Memory fallback
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.expiresAt < now) {
    buckets.set(key, { count: 1, expiresAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) return false;

  entry.count += 1;
  return true;
};


