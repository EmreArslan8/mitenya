import Footer from "@/components/Footer";
import MainLayout from "@/components/layouts/MainLayout";
import Navigation from "@/components/Navigation";
import { ShopContext, ShopContextProvider } from "@/contexts/ShopContext";
import { fetchShopFooter, fetchShopHeader } from "@/lib/api/cms";
import { defaultFontFamily } from "@/theme/theme";
import ThemeRegistry from "@/theme/ThemeRegistry";
import Script from "next/script";
import { Suspense } from "react";

const isProduction = process.env.NEXT_PUBLIC_HOST_ENV === "production";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerData = await fetchShopHeader();
const footerData = await fetchShopFooter()


  return (
    <html lang="tr">
      <head>
        {/* ✅ Google Tag Manager */}
        {isProduction && (
          <Script
            id="gtm-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-NQCZV9J');`,
            }}
          />
        )}

        {/* ✅ Google Search Console doğrulama meta etiketi */}
        {isProduction && (
          <meta
            name="google-site-verification"
            content="n6n2EfCF4_xpwn238Hwy0W5Vddi-Yq55wh052uDHDZk"
          />
        )}

        {/* Emotion / Viewport / Format ayarları */}
        <meta
          name="emotion-insertion-point"
          content="emotion-insertion-point"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded&display=swap"
        />
      </head>

      <body style={{ fontFamily: defaultFontFamily, overflowX: "hidden" }}>
        <ThemeRegistry>
          <ShopContextProvider>
            <Suspense fallback={null}>
              <Navigation data={headerData} />
            </Suspense>
            <MainLayout>{children}</MainLayout>
            <Footer data={footerData} />
          </ShopContextProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

export const generateMetadata = async () => ({
  title: { template: "%s | Kozmedo", default: "Kozmedo" },
  description: "Kozmedo",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_HOST_URL ?? "https://kozmedo.com"
  ),
  openGraph: {
    description: "Kozmedo",
    images: [
      {
        url: "/static/images/ogBanner.webp",
        alt: "Kozmedo",
        width: 1200,
        height: 630,
      },
    ],
  },
});
