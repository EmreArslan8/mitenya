/**
 * Rate limiter (Upstash Redis varsa onu, yoksa memory fallback).
 * Prod için UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN verildiğinde paylaşımlı limit çalışır.
 * Aksi halde process-local memory kullanılır (serverless'ta kalıcı değildir).
 */
const WINDOW_MS = 60_000; // 1 dakika
const MAX_REQUESTS = 60; // dakika başına 60 istek

const buckets = new Map<string, { count: number; expiresAt: number }>();

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const rateLimit = async (key: string): Promise<boolean> => {
  // Upstash Redis varsa onu kullan
  if (redisUrl && redisToken) {
    try {
      const incrBody = JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, Math.ceil(WINDOW_MS / 1000)],
      ]);

      const res = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: incrBody,
      });

      if (!res.ok) throw new Error(`Upstash error: ${res.status}`);
      const data = (await res.json()) as { result: [number, "OK"] };
      const current = Array.isArray(data?.result) ? data.result[0] : undefined;
      if (typeof current === "number") {
        return current <= MAX_REQUESTS;
      }
      // Eğer yanıt beklenmedikse mem fallback'e düş
    } catch (err) {
      console.error("RateLimit Upstash fallback:", err);
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
