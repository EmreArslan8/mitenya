import { ApiErrors } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { hasDeliveredPurchase } from '@/lib/api/reviewEligibility';
import { invalidateUserReviewsCache } from '@/lib/api/supabaseReviews';
import { createSupabaseServer } from '@/lib/supabase/server';
import { ProductIdSchema } from '@/lib/validations/products';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(5).max(2000),
  title: z.string().trim().max(200).optional(),
});

type ReviewRow = {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string | null;
  rating: number;
  text: string;
  title: string | null;
  verified: boolean;
  created_at: string;
};

const rowToReview = (row: ReviewRow) => ({
  id: row.id,
  name: row.user_name ?? undefined,
  rating: row.rating ?? undefined,
  title: row.title ?? undefined,
  text: row.text,
  verified: row.verified ?? false,
  date: row.created_at,
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIp = getClientIp(req);
    if (!(await rateLimit(`product_reviews_get:${userIp}`))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    const validation = ProductIdSchema.safeParse(id);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const supabase = await createSupabaseServer();

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const shouldPaginate = pageParam !== null || limitParam !== null;
    const page = Math.max(1, Math.min(parseInt(pageParam ?? '1', 10) || 1, 1000));
    const limit = Math.max(1, Math.min(parseInt(limitParam ?? '20', 10) || 20, 100));
    const offset = (page - 1) * limit;

    const baseQuery = supabase
      .from('product_reviews')
      .select('id, product_id, user_id, user_name, rating, text, title, verified, created_at')
      .eq('product_id', validation.data)
      .order('created_at', { ascending: false });

    const reviewResult = shouldPaginate
      ? await baseQuery.range(offset, offset + limit - 1)
      : await baseQuery;

    if (reviewResult.error) {
      console.error('API /products/[id]/reviews GET error:', reviewResult.error);
      return ApiErrors.internalError('Failed to fetch reviews');
    }

    const reviews = (reviewResult.data ?? []).map(rowToReview);
    const ratingsResult = shouldPaginate
      ? await supabase
          .from('product_reviews')
          .select('rating', { count: 'exact', head: false })
          .eq('product_id', validation.data)
      : null;
    const allRatings = shouldPaginate
      ? (ratingsResult?.data ?? []).map((r) => r.rating as number)
      : (reviewResult.data ?? []).map((r) => r.rating as number);
    const ratingCount = shouldPaginate
      ? ratingsResult?.count ?? allRatings.length
      : allRatings.length;
    const ratingAverage =
      ratingCount > 0
        ? allRatings.reduce((sum, r) => sum + r, 0) / ratingCount
        : 0;

    const response: {
      reviews: ReturnType<typeof rowToReview>[];
      rating?: { averageRating: number; totalCount: number };
      pagination?: { page: number; limit: number; totalCount: number };
    } = {
      reviews,
      rating: ratingCount
        ? { averageRating: Number(ratingAverage.toFixed(2)), totalCount: ratingCount }
        : undefined,
    };

    if (shouldPaginate) {
      response.pagination = { page, limit, totalCount: ratingCount };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('API /products/[id]/reviews GET error:', error);
    return ApiErrors.internalError('Failed to fetch reviews');
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIp = getClientIp(req);
    if (!(await rateLimit(`product_reviews_post:${userIp}`))) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    const validation = ProductIdSchema.safeParse(id);
    if (!validation.success) {
      return ApiErrors.validationError(validation.error.issues);
    }

    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Check if user has a delivered order containing this product
    const hasPurchased = await hasDeliveredPurchase(supabase, validation.data, user.email);
    if (!hasPurchased) {
      return NextResponse.json(
        { error: 'Bu ürünü satın almadan yorum yazamazsınız.' },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const parsed = createReviewSchema.safeParse(body);
    if (!parsed.success) {
      return ApiErrors.validationError(parsed.error.issues);
    }

    const rawUserName =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split('@')[0] ??
      'User';

    // XSS koruması: HTML tag'lerini ve tehlikeli karakterleri temizle
    const userName = rawUserName
      .replace(/<[^>]*>/g, '')
      .replace(/[&<>"'`]/g, '')
      .trim()
      .slice(0, 100);

    const upsertPayload = {
      product_id: validation.data,
      user_id: user.id,
      user_name: userName,
      rating: parsed.data.rating,
      text: parsed.data.text,
      title: parsed.data.title ?? null,
      verified: true,
    };

    const { data: saved, error } = await supabase
      .from('product_reviews')
      .upsert(upsertPayload, { onConflict: 'product_id,user_id' })
      .select('id, product_id, user_id, user_name, rating, text, title, verified, created_at')
      .single();

    if (error) {
      console.error('API /products/[id]/reviews POST error:', error);
      return ApiErrors.internalError('Failed to save review');
    }

    await invalidateUserReviewsCache(user.id);
    return NextResponse.json({ review: rowToReview(saved as ReviewRow) }, { status: 201 });
  } catch (error) {
    console.error('API /products/[id]/reviews POST error:', error);
    return ApiErrors.internalError('Failed to save review');
  }
}
