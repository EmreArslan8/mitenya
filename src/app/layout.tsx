// app/layout.tsx
import plusJakartaSans from '@/fonts/plusJakartaSans';
import ThemeRegistry from '@/theme/ThemeRegistry';
import Script from 'next/script';


const isProduction = process.env.NEXT_PUBLIC_HOST_ENV === 'production';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {isProduction && (
         <Script
         id="gtm-init"                     // ← ekle
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

        {isProduction && (
          <meta
          name="google-site-verification"
          content="56m9ogKwjWscJgWxYAunQn2KRJPJflbmx1w_1ZvUUXY"
        />
        )}


        {/* 🔴 ÖNEMLİ: Emotion insertion point */}
        <meta name="emotion-insertion-point" content="emotion-insertion-point" />

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
      
      </head>
      <body
        className={plusJakartaSans.className}
        style={{ overflowX: "hidden" }}
      >
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}

export const generateMetadata = async () => {
  return {
    title: { template: '%s | Kozmedo', default: 'Kozmedo' },
    description: 'Kozmedo',
    metadataBase: new URL(process.env.NEXT_PUBLIC_HOST_URL ?? 'https://kozmedo.com'),
    openGraph: {
      description: 'Kozmedo',
      images: [
        { url: '/static/images/ogBanner.webp', alt: 'Kozmedo', width: 1200, height: 630 },
      ],
    },
  };
};
