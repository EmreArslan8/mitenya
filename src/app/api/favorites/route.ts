import { ApiErrors, createSuccessResponse } from '@/lib/api/errors';
import { createSupabaseServer } from '@/lib/supabase/server';
import { z } from 'zod';

const createFavoriteSchema = z.object({
  productId: z.string().trim().min(1),
});

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .select('product_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET /api/favorites error:', error);
      return ApiErrors.internalError('Favoriler getirilemedi');
    }

    return createSuccessResponse({
      productIds: (data ?? []).map((row) => String(row.product_id)),
    });
  } catch (error) {
    console.error('GET /api/favorites error:', error);
    return ApiErrors.internalError('Favoriler getirilemedi');
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return ApiErrors.badRequest('Invalid JSON');
    }

    const parsed = createFavoriteSchema.safeParse(body);
    if (!parsed.success) {
      return ApiErrors.validationError(parsed.error.issues);
    }

    const { error } = await supabase
      .from('user_favorites')
      .upsert(
        {
          user_id: user.id,
          product_id: parsed.data.productId,
        },
        { onConflict: 'user_id,product_id' }
      );

    if (error) {
      console.error('POST /api/favorites error:', error);
      return ApiErrors.internalError('Favori eklenemedi');
    }

    return createSuccessResponse({ productId: parsed.data.productId }, 201);
  } catch (error) {
    console.error('POST /api/favorites error:', error);
    return ApiErrors.internalError('Favori eklenemedi');
  }
}
