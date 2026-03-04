import { ApiErrors } from '@/lib/api/errors';
import { rateLimit } from '@/lib/api/rateLimit';
import { getClientIp } from '@/lib/api/getClientIp';
import { hasDeliveredPurchase } from '@/lib/api/reviewEligibility';
import { createSupabaseServer } from '@/lib/supabase/server';
import { ProductIdSchema } from '@/lib/validations/products';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userIp = getClientIp(req);
    if (!(await rateLimit(`review_eligibility:${userIp}`))) {
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
      return NextResponse.json({ eligible: false, reason: 'not_authenticated' });
    }

    if (!user.email) {
      return NextResponse.json({ eligible: false, reason: 'no_email' });
    }

    const hasPurchased = await hasDeliveredPurchase(supabase, validation.data, user.email);
    if (!hasPurchased) {
      return NextResponse.json({ eligible: false, reason: 'not_purchased' });
    }

    // Check if user already reviewed this product
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', validation.data)
      .eq('user_id', user.id)
      .limit(1);

    if (existingReview && existingReview.length > 0) {
      return NextResponse.json({ eligible: false, reason: 'already_reviewed' });
    }

    return NextResponse.json({ eligible: true });
  } catch (error) {
    console.error('API /products/[id]/reviews/eligibility GET error:', error);
    return ApiErrors.internalError('Failed to check eligibility');
  }
}
