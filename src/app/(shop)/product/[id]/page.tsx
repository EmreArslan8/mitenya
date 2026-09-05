import { R2_IMAGE_PROFILES, productMainImagePath, r2ImageUrl, r2Url } from '@/lib/utils/r2';
import { getNextImageWidths } from '@/lib/imageSizesConfig';
import imageLoader from '@/lib/imageLoader';
import { Metadata } from 'next';
import { preload } from 'react-dom';
import { Suspense } from 'react';
import { getProductData } from './data';
import Loading from './loading';
import SuspensedView from './suspensedView';

/**
 * PDP ana gorseli LCP elementi; HTML head'inden erkenden preload ediliyor.
 *
 * KRITIK: preload'un srcset'i galerinin bastigi srcset ile BIREBIR ayni
 * olmali. Galeri artik next/image kullaniyor, bu yuzden adaylar da ayni
 * loader ve ayni genislik listesinden uretiliyor; aksi halde tarayici
 * preload'dan bir adayi, galeriden baskasini indirir (cift indirme).
 */
const preloadProductMainImage = (imagePathOrUrl: string | undefined) => {
  if (!imagePathOrUrl) return;

  const profile = R2_IMAGE_PROFILES.productPdpPrimary;
  const rawSrc = r2Url(imagePathOrUrl);
  const widths = getNextImageWidths(profile.sizes);

  preload(
    r2ImageUrl(imagePathOrUrl, {
      width: 1280,
      quality: profile.quality,
      format: profile.format,
    }),
    {
      as: 'image',
      fetchPriority: 'high',
      imageSrcSet: widths
        .map((width) => `${imageLoader({ src: rawSrc, width, quality: profile.quality })} ${width}w`)
        .join(', '),
      imageSizes: profile.sizes,
    }
  );
};

/** Rota parametresi slug de olabilir, UUID de. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ProductPage = async ({ params }: { params: { id: string } }) => {
  // ADR-0001: isPreviewBot() kaldırıldı — headers() çağırıyordu ve ISR'ı engelliyordu.
  // Sayfa artık cache'lendiği için crawler'lara render maliyeti yok; gate gereksiz.
  const { id } = await params;
  // Gorsel yolu slug uzerine kurulu (`products/<slug>/main.webp`). Parametre
  // UUID ise bu yol var olmayan bir dosyayi gosterir ve preload bosa giden bir
  // istek uretir (Lighthouse'ta statusCode -1 olarak gorunuyordu).
  if (!UUID_PATTERN.test(id)) {
    preloadProductMainImage(productMainImagePath(id));
  }
  const data = await getProductData(id);

  return (
    <>
      <Suspense fallback={<Loading />} key={id}> 
        <SuspensedView params={{ id }} initialData={data} />
      </Suspense>
    </>
  );
};

export const maxDuration = 30;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = await params; // ✔ zorunlu çözüm

  // ADR-0001: isSSR()/isPreviewBot() gate kaldırıldı (headers() → ISR engeli).
  // Metadata artık her zaman üretilir ve cache'lenir.
  const data = await getProductData(id);

  const fullName = `${data?.brand ?? ''} ${data?.name ?? ''}`.trim();
  const defaultDescription = `${fullName} - Orijinal Kore kozmetik ürünü. En uygun fiyat ve hızlı kargo ile Mitenya'da.`;

  const title = data?.metaTitle || `${fullName} | Mitenya`;
  const description = data?.metaDescription || defaultDescription;
  const canonical = data?.url || `/product/${id}`;

  return {
    title: { absolute: title },
    description,
    keywords: data?.metaKeywords?.split(',').map((k: string) => k.trim()),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [
        {
          url: data?.imgSrc ?? '/static/images/ogBanner.webp',
          alt: fullName,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

// ADR-0001: ISR. force-static → sayfa kabuğu cache'lenir (TTFB ~1s → ~0.1s).
// revalidate=300 güvenlik ağı; asıl tazelik webhook → revalidateTag('product:<slug>').
// DİKKAT: force-static altında cookies()/headers() sessizce boş döner (throw etmez).
// Render ağacına kişiselleştirilmiş/istek-zamanlı veri EKLEME — eklemen gerekirse
// o parçayı client island yap (bkz. ADR-0001 "neden client island değil" istisnaları).
export const dynamic = 'force-static';
export const revalidate = 300;

export default ProductPage;
