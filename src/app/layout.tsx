

import Footer from "@/components/Footer";
import MainLayout from "@/components/layouts/MainLayout";
import Navigation from "@/components/Navigation";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { ShopContextProvider } from "@/contexts/ShopContext";
import { fetchShopFooter, fetchShopHeader } from "@/lib/api/cms";
import { albertSans } from "@/lib/fonts";
import ThemeRegistry from "@/theme/ThemeRegistry";
import { Suspense } from "react";

const isProduction = process.env.NEXT_PUBLIC_HOST_ENV === "production";
const baseUrl = process.env.NEXT_PUBLIC_HOST_URL ?? "https://mitenya.com";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerData = await fetchShopHeader();
  const footerData = await fetchShopFooter();


  return (
  <html lang="tr" className={albertSans.variable}>
      <head>
        <meta charSet="utf-8" />
        {isProduction && (
          <meta
            name="google-site-verification"
            content="n6n2EfCF4_xpwn238Hwy0W5Vddi-Yq55wh052uDHDZk"
          />
        )}


        <meta
          name="emotion-insertion-point"
          content="emotion-insertion-point"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Mitenya",
              alternateName: "Mitenya",
              url: baseUrl,
            }),
          }}
        />
      </head>

      <body style={{ overflowX: "hidden" }}>
        <ThemeRegistry>
          <CookieConsentProvider>
            <AuthContextProvider>
              <ShopContextProvider>
                <Suspense fallback={<div style={{ height: '100px' }} />}>
                  <Navigation data={headerData} />
                </Suspense>

                <MainLayout>
                  <Suspense fallback={<div>Yükleniyor...</div>}>{children}</Suspense>
                </MainLayout>

                <Footer data={footerData} />
              </ShopContextProvider>
            </AuthContextProvider>
          </CookieConsentProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

export const generateMetadata = async () => ({
  title: { template: "%s | Mitenya", default: "Mitenya | Kore Kozmetik ve Cilt Bakım Ürünleri" },
  description: "Mitenya - Orijinal Kore kozmetik ve cilt bakım ürünleri. K-beauty, Kore makyaj, serum, nemlendirici ve cilt bakım rutini ürünlerinde geniş ürün yelpazesi ve uygun fiyatlar.",
  keywords: ["kore kozmetik", "k-beauty", "korean skincare", "kore cilt bakımı", "kore makyaj", "kozmetik", "cilt bakımı", "serum", "nemlendirici", "mitenya"],
  metadataBase: new URL(baseUrl),
  applicationName: "Mitenya",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Mitenya",
    title: "Mitenya | Kore Kozmetik ve Cilt Bakım Ürünleri",
    description: "Orijinal Kore kozmetik ve cilt bakım ürünleri. K-beauty, Kore makyaj, serum, nemlendirici ve cilt bakım rutini ürünleri.",
    locale: "tr_TR",
    images: [
      {
        url: "/static/images/ogBanner.webp",
        alt: "Mitenya - Kore Kozmetik ve Cilt Bakım Ürünleri",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mitenya | Kore Kozmetik ve Cilt Bakım Ürünleri",
    description: "Orijinal Kore kozmetik ve cilt bakım ürünleri. K-beauty, Kore makyaj, serum ve cilt bakım rutini.",
  },
  robots: {
    index: true,
    follow: true,
  },
});
