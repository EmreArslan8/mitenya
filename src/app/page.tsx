import { fetchShopIndex } from "@/lib/api/cms";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import HomePageView from "./view";
import isPreviewBot from "@/lib/utils/isPreviewBot";

const HomePage = async ({
  params: { slug },
}: {
  params: { slug?: string };
}) => {
  const bot = await isPreviewBot();
  if (bot) return null;

  const data = await fetchShopIndex(slug);
  if (!data) notFound();

  return (
    <main>
      <HomePageView data={data} />
    </main>
  );
};

export const generateMetadata = async ({
  params: { slug },
}: {
  params: { slug?: string };
}): Promise<Metadata> => {
  const data = await fetchShopIndex(slug);
  if (!data) notFound();

  return {
    title: `${data.title} | Kozmedo`,
    openGraph: {
      title: `${data.title} | Kozmedo`,
      images: [
        { url: "/static/images/ogBanner.webp", width: 1200, height: 630 },
      ],
    },
  };
};

export default HomePage;
