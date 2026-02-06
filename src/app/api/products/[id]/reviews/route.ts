import { ApiErrors } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { createSupabaseServer } from '@/lib/supabase/server';
import { ProductIdSchema } from '@/lib/validations/products';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(5).max(2000),
});

type ReviewRow = {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string | null;
  rating: number;
  text: string;
  created_at: string;
};

const rowToReview = (row: ReviewRow) => ({
  id: row.id,
  name: row.user_name ?? undefined,
  rating: row.rating ?? undefined,
  text: row.text,
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
    const { data, error } = await supabase
      .from('product_reviews')
      .select('id, product_id, user_id, user_name, rating, text, created_at')
      .eq('product_id', validation.data)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('API /products/[id]/reviews GET error:', error);
      return ApiErrors.internalError('Failed to fetch reviews');
    }

    const reviews = (data ?? []).map(rowToReview);
    const ratingCount = reviews.length;
    const ratingAverage =
      ratingCount > 0
        ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratingCount
        : 0;

    return NextResponse.json({
      reviews,
      rating: ratingCount
        ? { averageRating: Number(ratingAverage.toFixed(2)), totalCount: ratingCount }
        : undefined,
    });
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

    const userName =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      user.email?.split('@')[0] ??
      'User';

    const upsertPayload = {
      product_id: validation.data,
      user_id: user.id,
      user_name: userName,
      rating: parsed.data.rating,
      text: parsed.data.text,
    };

    const { data: saved, error } = await supabase
      .from('product_reviews')
      .upsert(upsertPayload, { onConflict: 'product_id,user_id' })
      .select('id, product_id, user_id, user_name, rating, text, created_at')
      .single();

    if (error) {
      console.error('API /products/[id]/reviews POST error:', error);
      return ApiErrors.internalError('Failed to save review');
    }

    return NextResponse.json({ review: rowToReview(saved as ReviewRow) }, { status: 201 });
  } catch (error) {
    console.error('API /products/[id]/reviews POST error:', error);
    return ApiErrors.internalError('Failed to save review');
  }
}

