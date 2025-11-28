import  bring from "@/lib/api/bring";

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const GET = async () => {
  if (!cmsApiUrl || !cmsBearer) {
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }

  const url = `${cmsApiUrl}/shop-fixed-prices`;

  // ❌ let params: any
  // ✅ params sabit → const
  // ❌ any kaldırıldı → proper type
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
      console.error("[shop-fixed-prices] bring error:", error);
      return Response.json([], { status: 500 });
    }

    const fixedPrices = data?.data?.[0]?.attributes?.fixedPrices ?? [];

    return Response.json(fixedPrices, { status: 200 });
  } catch (error) {
    console.error("[shop-fixed-prices] Unexpected error:", error);
    return Response.json([], { status: 500 });
  }
};
