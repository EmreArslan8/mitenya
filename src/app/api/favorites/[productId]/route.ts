import { ApiErrors, createSuccessResponse } from '@/lib/api/errors';
import { createSupabaseServer } from '@/lib/supabase/server';

interface Params {
  params: Promise<{ productId: string }>;
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return ApiErrors.unauthorized();
    }

    const { productId } = await params;
    if (!productId?.trim()) {
      return ApiErrors.badRequest('productId is required');
    }

    const normalizedProductId = productId;

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', normalizedProductId);

    if (error) {
      console.error('DELETE /api/favorites/[productId] error:', error);
      return ApiErrors.internalError('Favori kaldırılamadı');
    }

    return createSuccessResponse({ productId: normalizedProductId });
  } catch (error) {
    console.error('DELETE /api/favorites/[productId] error:', error);
    return ApiErrors.internalError('Favori kaldırılamadı');
  }
}
