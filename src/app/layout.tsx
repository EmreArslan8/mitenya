import Footer from "@/components/Footer";
import MainLayout from "@/components/layouts/MainLayout";
import Navigation from "@/components/Navigation";
import { AuthContextProvider } from "@/contexts/AuthContext";
import { ShopContextProvider } from "@/contexts/ShopContext";
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
          <AuthContextProvider>
            <ShopContextProvider>
        {/* Navigation içinde useSearchParams olduğu için Suspense şart */}
        <Suspense fallback={<div style={{ height: '100px' }} />}> 
          <Navigation data={headerData} />
        </Suspense>
        
        <MainLayout>
          {/* Sayfa içerikleri için de Suspense eklemek iyi bir pratik */}
          <Suspense fallback={<div>Yükleniyor...</div>}>
            {children}
          </Suspense>
        </MainLayout>
        
        <Footer data={footerData} />
            </ShopContextProvider>
          </AuthContextProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}

export const generateMetadata = async () => ({
  title: { template: "%s | Mitenya", default: "Mitenya | Kozmetik ve Güzellik Ürünleri" },
  description: "Mitenya - En kaliteli kozmetik ve güzellik ürünleri. Cilt bakımı, makyaj, parfüm ve kişisel bakım ürünlerinde geniş ürün yelpazesi ve uygun fiyatlar.",
  keywords: ["kozmetik", "güzellik", "cilt bakımı", "makyaj", "parfüm", "kişisel bakım", "mitenya", "online kozmetik"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_HOST_URL ?? "https://mitenya.com"
  ),
  openGraph: {
    type: "website",
    siteName: "Mitenya",
    title: "Mitenya | Kozmetik ve Güzellik Ürünleri",
    description: "En kaliteli kozmetik ve güzellik ürünleri. Cilt bakımı, makyaj, parfüm ve kişisel bakım ürünlerinde geniş ürün yelpazesi.",
    locale: "tr_TR",
    images: [
      {
        url: "/static/images/ogBanner.webp",
        alt: "Mitenya - Kozmetik ve Güzellik Ürünleri",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mitenya | Kozmetik ve Güzellik Ürünleri",
    description: "En kaliteli kozmetik ve güzellik ürünleri. Cilt bakımı, makyaj, parfüm ve kişisel bakım.",
  },
  robots: {
    index: true,
    follow: true,
  },
});
