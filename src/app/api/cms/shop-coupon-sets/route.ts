import bring from '@/lib/api/bring';

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const GET = async () => {
  if (!cmsApiUrl || !cmsBearer) {
    return Response.json({ coupons: [] }, { status: 200 });
  }

  const [res] = await bring(`${cmsApiUrl}/shop-coupon-sets`, {
    params: {
      publicationState: 'live',
      populate: 'deep,4',
      'pagination[pageSize]': 1,
      sort: 'publishedAt:desc',
    },
    headers: { Authorization: `Bearer ${cmsBearer}` },
    static: true,
    next: { revalidate: 60 },
  });

  const attributes = res?.data?.[0]?.attributes ?? {};
  const { coupons = [] } = attributes;

  return Response.json({ coupons });
};
