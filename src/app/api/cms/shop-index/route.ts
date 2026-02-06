import bring from "@/lib/api/bring";
import { NextRequest } from "next/server";

// ISR Ayarı: Bu route'un build sırasında veya sonrasında ne kadar süreyle cache'leneceğini belirler.
// 60 saniye boyunca veriyi cache'den döner, sonra arka planda günceller.
export const revalidate = 60; 

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const GET = async (req: NextRequest) => {
  const start = Date.now();
  const slug = req.nextUrl.searchParams.get("slug");

  if (!cmsApiUrl || !cmsBearer) {
    console.error("❌ Missing environment variables:", {
      NEXT_PUBLIC_STRAPI_URL: cmsApiUrl,
      STRAPI_BEARER: cmsBearer,
    });

    return Response.json(
      { message: "Internal Server Error: Missing environment variables" },
      { status: 500 }
    );
  }

  const url = `${cmsApiUrl}/shops`;

  const params: Record<string, string | number | boolean> = {
    publicationState: "live",
    "pagination[pageSize]": 1,
    populate: "deep,5",
  };

  if (slug) {
    params["filters[slug][$eq]"] = slug;
  } else {
    params["filters[slug][$null]"] = true;
  }

  try {
    // bring fonksiyonu fetch tabanlıysa, ikinci parametreye Next.js fetch opsiyonlarını ekliyoruz.
    const fetchStart = Date.now();
    const [data, error] = await bring(url, {
      params,
      headers: { 
        Authorization: `Bearer ${cmsBearer}`,
        "Content-Type": "application/json"
      },
      // ISR için fetch seviyesinde revalidate
      next: { revalidate: 60 } 
    });
    console.log(`[TIMING] /api/cms/shop-index bring ${Date.now() - fetchStart}ms`);

    if (error) {
      console.error("❌ bring() error:", error);
      return Response.json({ error: String(error) }, { status: 500 });
    }

    const attributes = data?.data?.[0]?.attributes;

    if (!attributes) {
      return Response.json(
        { message: "Not Found - No attributes in response" },
        { status: 404 }
      );
    }

    const { title, blocks, gap } = attributes;

    console.log(`[TIMING] /api/cms/shop-index total ${Date.now() - start}ms`);
    return Response.json({ title, blocks, gap }, { status: 200 });
  } catch (err) {
    console.error("🔥 Unexpected Error:", err);
    return Response.json({ err: String(err) }, { status: 500 });
  }
};
