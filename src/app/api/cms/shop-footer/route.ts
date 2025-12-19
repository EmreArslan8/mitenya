import bring from '@/lib/api/bring';

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const GET = async () => {
  if (!cmsApiUrl || !cmsBearer) {
    return Response.json({}, { status: 200 });
  }

  const [res] = await bring(`${cmsApiUrl}/shop-footers`, {
    params: {
      publicationState: 'live',
      populate: 'deep,4',
      'pagination[pageSize]': 1,
    },
    headers: { Authorization: `Bearer ${cmsBearer}` },
    static: true,
    next: { revalidate: 60 },
  });

  const attributes = res?.data?.[0]?.attributes ?? {};
  const { links, socials, address, vendors } = attributes;

  return Response.json({ links, socials, address, vendors });
};
