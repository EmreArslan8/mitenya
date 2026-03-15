// Server-only - Bu dosya sadece Server Component'larda kullanılmalı
import { createSupabaseServer } from '../supabase/server';
import { isUpstashEnabled, parseUpstashResult, runUpstashPipeline } from '../cache/upstashRedis';

const REVIEWS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 dakika

export type UserReview = {
  id: string;
  productId: string;
  productName: string;
  productUrl: string;
  rating: number;
  title: string | null;
  text: string;
  verified: boolean;
  createdAt: string;
};

function cacheKey(userId: string) {
  return `user:reviews:${userId}`;
}

async function getFromRedis(userId: string): Promise<UserReview[] | null> {
  if (!isUpstashEnabled()) return null;
  try {
    const result = await runUpstashPipeline([['GET', cacheKey(userId)]]);
    const raw = parseUpstashResult(result[0]);
    if (typeof raw !== 'string') return null;
    return JSON.parse(raw) as UserReview[];
  } catch {
    return null;
  }
}

async function setToRedis(userId: string, reviews: UserReview[]): Promise<void> {
  if (!isUpstashEnabled()) return;
  try {
    await runUpstashPipeline([
      ['SET', cacheKey(userId), JSON.stringify(reviews), 'PX', REVIEWS_CACHE_TTL_MS],
    ]);
  } catch (err) {
    console.error('UserReviews Redis write error:', err);
  }
}

export async function invalidateUserReviewsCache(userId: string): Promise<void> {
  if (!isUpstashEnabled()) return;
  try {
    await runUpstashPipeline([['DEL', cacheKey(userId)]]);
  } catch {}
}

export async function fetchUserReviewsCount(): Promise<number> {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    // Full cache varsa oradan dön, ekstra query yok
    const cached = await getFromRedis(user.id);
    if (cached) return cached.length;

    // Yoksa sadece COUNT çek
    const { count, error } = await supabase
      .from('product_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return error ? 0 : (count ?? 0);
  } catch {
    return 0;
  }
}

export async function fetchUserReviews(): Promise<UserReview[]> {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const cached = await getFromRedis(user.id);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('product_reviews')
      .select('id, product_id, rating, title, text, verified, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchUserReviews error:', error.message, error.code, error.details, error.hint);
      return [];
    }

    const rows = data || [];
    const productIds = [...new Set(rows.map((r) => r.product_id))];

    const productMap: Record<string, { name: string; slug: string }> = {};
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, slug')
        .in('id', productIds);
      for (const p of products ?? []) {
        productMap[p.id] = { name: p.name, slug: p.slug };
      }
    }

    const reviews: UserReview[] = rows.map((row) => {
      const product = productMap[row.product_id];
      return {
        id: row.id,
        productId: row.product_id,
        productName: product?.name ?? '',
        productUrl: product?.slug ? `/p/${product.slug}` : `/p/${row.product_id}`,
        rating: row.rating,
        title: row.title ?? null,
        text: row.text,
        verified: row.verified ?? false,
        createdAt: row.created_at,
      };
    });

    await setToRedis(user.id, reviews);
    return reviews;
  } catch (err) {
    console.error('fetchUserReviews error:', err);
    return [];
  }
}
