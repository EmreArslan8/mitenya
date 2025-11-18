import { bring } from "@/lib/api/bring";

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const GET = async () => {
  if (!cmsApiUrl || !cmsBearer) {
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }

  const url = `${cmsApiUrl}/shop-headers`;

  // ❌ let params: any
  // ✅ const + proper type
  const params: Record<string, string | number | boolean> = {
    publicationState: "live",
    "pagination[pageSize]": 9999,
    populate: "deep,4",
  };

  try {
    const [data, error] = await bring(url, {
      params,
      headers: { Authorization: `Bearer ${cmsBearer}` },
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const attributes = data?.data?.[0]?.attributes ?? {};

    const { links, bannerLinks } = attributes;

    return Response.json({ links, bannerLinks }, { status: 200 });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
};
