'use client';

import Script from 'next/script';
import { CookieConsentState } from '@/contexts/CookieConsentContext';

const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? 'GTM-5CR26XHK';
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? 'G-W2DHP8ZRJN';
const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const isProduction = process.env.NEXT_PUBLIC_HOST_ENV === 'production';

interface CookieConsentScriptsProps {
  consent: CookieConsentState | null;
  isReady: boolean;
}

const CookieConsentScripts = ({ consent, isReady }: CookieConsentScriptsProps) => {
  if (!isProduction || !isReady) return null;

  return (
    <>
      {consent?.analytics && gaMeasurementId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaMeasurementId}');`,
            }}
          />
        </>
      )}

      {consent?.marketing && metaPixelId && (
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`,
          }}
        />
      )}

      {consent?.marketing && gtmId && (
        <>
          <Script
            id="gtm-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');`,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}
    </>
  );
};

export default CookieConsentScripts;
