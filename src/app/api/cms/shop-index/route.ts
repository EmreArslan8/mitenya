import  bring  from "@/lib/api/bring";
import { NextRequest } from "next/server";

const cmsApiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
const cmsBearer = process.env.STRAPI_BEARER;

export const GET = async (req: NextRequest) => {
  const slug = req.nextUrl.searchParams.get("slug");

  if (!cmsApiUrl || !cmsBearer) {
    console.error("❌ Missing environment variables:", {
      NEXT_PUBLIC_API_URL: cmsApiUrl,
      STRAPI_BEARER: cmsBearer,
    });

    return Response.json(
      { message: "Internal Server Error: Missing environment variables" },
      { status: 500 }
    );
  }

  const url = `${cmsApiUrl}/shops`;

  // -----------------------------------
  // ✔ params CONST + STRONG TYPE
  // -----------------------------------
  const params: Record<string, string | number | boolean> = {
    publicationState: "live",
    "pagination[pageSize]": 9999,
    populate: "deep,10",
  };

  if (slug) {
    params["filters[slug][$eq]"] = slug;
  } else {
    params["filters[slug][$null]"] = true;
  }

  try {
    const [data, error] = await bring(url, {
      params,
      headers: { Authorization: `Bearer ${cmsBearer}` },
    });

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

    return Response.json({ title, blocks, gap }, { status: 200 });
  } catch (err) {
    console.error("🔥 Unexpected Error:", err);
    return Response.json({ err: String(err) }, { status: 500 });
  }
};