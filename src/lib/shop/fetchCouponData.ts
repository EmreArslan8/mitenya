import { supabaseAdmin } from '@/lib/supabase/admin';
import { ShopCoupon } from '@/lib/api/types';

export interface CouponData {
  percent: number;
  affiliateCode: string | null;
}

export async function fetchCouponData(normalizedCode?: string): Promise<CouponData | undefined> {
  const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const cmsBearer = process.env.STRAPI_BEARER;

  if (!normalizedCode || !cmsApiUrl || !cmsBearer) return undefined;

  try {
    const params = new URLSearchParams({
      publicationState: 'live',
      populate: 'deep,4',
      'pagination[pageSize]': '1',
      sort: 'publishedAt:desc',
    });

    const res = await fetch(`${cmsApiUrl}/shop-coupon-sets?${params.toString()}`, {
      headers: { Authorization: `Bearer ${cmsBearer}` },
      cache: 'no-store',
    });

    if (!res.ok) return undefined;

    const data = await res.json();
    const coupons: ShopCoupon[] = data?.data?.[0]?.attributes?.coupons ?? [];
    const now = new Date();

    const activeCoupon = coupons.find((coupon) => {
      const code = coupon.code?.trim().toUpperCase();
      const start = coupon.startDate ? new Date(coupon.startDate) : null;
      const end = coupon.endDate ? new Date(coupon.endDate) : null;

      if (!code || code !== normalizedCode) return false;
      if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
        return false;
      return now >= start && now <= end;
    });

    const percent = activeCoupon?.discountPercent;
    if (typeof percent !== 'number' || percent <= 0) return undefined;

    const { data: affiliate } = await supabaseAdmin
      .from('affiliates')
      .select('code')
      .eq('code', normalizedCode)
      .eq('status', 'active')
      .maybeSingle();

    return { percent, affiliateCode: affiliate?.code ?? null };
  } catch (error) {
    console.error('fetchCouponData error:', error);
    return undefined;
  }
}
