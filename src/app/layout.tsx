

import Footer from "@/components/Footer";
import AttributionTracker from "@/components/analytics/AttributionTracker";
import MainLayout from "@/components/layouts/MainLayout";
import Navigation from "@/components/Navigation";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { FavoritesContextProvider } from "@/contexts/FavoritesContext";
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
              alternateName: "Mitenya Kozmetik",
              url: baseUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${baseUrl}/search?query={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Mitenya",
              alternateName: "Mitenya Kozmetik",
              url: baseUrl,
              logo: `${baseUrl}/static/images/ogBanner.webp`,
              description: "Orijinal Kore kozmetik ve cilt bakım ürünleri. K-beauty, serum, nemlendirici ve cilt bakım rutini ürünleri.",
              contactPoint: {
                "@type": "ContactPoint",
                email: "destek@mitenya.com",
                contactType: "customer service",
                availableLanguage: "Turkish",
              },
            }),
          }}
        />
      </head>

      <body style={{ overflowX: "hidden" }}>
        <ThemeRegistry>
          <CookieConsentProvider>
            <AttributionTracker />
            <AuthContextProvider>
              <FavoritesContextProvider>
                <ShopContextProvider>
                  <Suspense fallback={<div style={{ height: '100px' }} />}>
                    <Navigation data={headerData} />
                  </Suspense>

                  <MainLayout>
                    <Suspense fallback={<div>Yükleniyor...</div>}>{children}</Suspense>
                  </MainLayout>

                  <Footer data={footerData} />
                </ShopContextProvider>
              </FavoritesContextProvider>
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
    icon: [
      { url: "/static/images/favicon-16x16-v2026.png", sizes: "16x16", type: "image/png" },
      { url: "/static/images/favicon-32x32-v2026.png", sizes: "32x32", type: "image/png" },
      { url: "/static/images/favicon-48x48-v2026.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-2026.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    shortcut: ["/static/images/favicon-32x32-v2026.png"],
    apple: [{ url: "/static/images/apple-touch-icon-v2026.png", type: "image/png" }],
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
