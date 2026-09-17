import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLdScript from '@/components/SEO/JsonLdScript';
import { BRAND_PAGE_PRODUCT_LIMIT } from '@/lib/constants/shop';
import { buildBrandJsonLd } from '@/lib/seo/brandJsonLd';
import { brandPath } from '@/lib/shop/brandPath';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { getBrandPageData } from './data';
import { attachProductNotes, buildRoutineSteps, fallbackIntro, toParagraphs } from './model';
import BrandHero from './sections/BrandHero';
import BrandProducts from './sections/BrandProducts';
import BrandSection from './sections/BrandSection';
import SectionNav, { type SectionLink } from './sections/SectionNav';
import {
  BrandAbout,
  BrandComparison,
  BrandFaq,
  BrandGuides,
  BrandIngredients,
  BrandRoutine,
  OtherBrands,
} from './sections/BrandContentSections';

const host = (process.env.NEXT_PUBLIC_HOST_URL ?? 'https://mitenya.com').replace(/\/$/, '');

type PageProps = { params: Promise<{ slug: string }> };

const BrandPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const data = await getBrandPageData(slug);
  if (!data) notFound();

  const { brand, content, otherBrands } = data;
  const products = attachProductNotes(data.products, content?.productNotes ?? []);
  const routine = buildRoutineSteps(content?.routine ?? [], data.products);
  const aboutParagraphs = toParagraphs(content?.about);
  const intro = content?.intro || fallbackIntro(brand.name, brand.productCount);
  const hasMore = brand.productCount > products.length && products.length >= BRAND_PAGE_PRODUCT_LIMIT;

  // Bölümler yalnızca verisi varsa çizilir; gezinme linkleri aynı listeden türer.
  const sections = {
    ingredients: Boolean(content?.ingredients.length),
    comparison: Boolean(content?.comparison?.rows.length),
    routine: routine.length > 0,
    faq: Boolean(content?.faqs.length),
    guides: Boolean(content?.blogs.length),
  };
  const navLinks: SectionLink[] = [
    { id: 'urunler', label: 'Ürünler' },
    ...(sections.ingredients ? [{ id: 'icerikler', label: 'İçerikler' }] : []),
    ...(sections.comparison ? [{ id: 'karsilastir', label: 'Hangisi bana uygun?' }] : []),
    ...(sections.routine ? [{ id: 'rutin', label: 'Rutin' }] : []),
    ...(sections.faq ? [{ id: 'sss', label: 'Sık sorulanlar' }] : []),
  ];

  return (
    <div className="flex flex-col gap-12 px-2 pt-3 pb-4 md:gap-24 md:px-6">
      <JsonLdScript
        json={buildBrandJsonLd({
          name: brand.name,
          slug: brand.slug,
          description: content?.intro,
          logoUrl: content?.logo?.data?.attributes?.url,
          products: data.products,
        })}
      />

      <div className="flex flex-col gap-4 md:gap-7">
        <BrandHero
          name={brand.name}
          tagline={content?.tagline}
          intro={intro}
          logo={content?.logo}
          facts={content?.facts ?? []}
        />
        <SectionNav links={navLinks} />
      </div>

      <BrandSection id="urunler" title={`${brand.name} ürünleri`}>
        {products.length ? (
          <BrandProducts
            products={products}
            moreHref={hasMore ? searchUrlFromOptions({ brand: brand.slug }) : undefined}
          />
        ) : (
          <p className="text-text-medium-light">Bu markanın şu an satışta ürünü yok.</p>
        )}
      </BrandSection>

      {sections.ingredients && content ? (
        <BrandSection id="icerikler" title="Formüllerin arkasındaki içerikler">
          <BrandIngredients items={content.ingredients} />
        </BrandSection>
      ) : null}

      {sections.comparison && content?.comparison ? (
        <BrandSection id="karsilastir" title={content.comparison.title} subtitle={content.comparison.subtitle}>
          <BrandComparison table={content.comparison} />
        </BrandSection>
      ) : null}

      {sections.routine ? (
        <BrandSection
          id="rutin"
          title={`Rutininde ${brand.name}`}
          subtitle="Markanın ürünleri hangi adımda? Eksik adımları diğer markalarla tamamla."
        >
          <BrandRoutine steps={routine} />
        </BrandSection>
      ) : null}

      {sections.faq && content ? (
        <BrandSection id="sss" title={`${brand.name} hakkında sık sorulanlar`}>
          <BrandFaq items={content.faqs} />
        </BrandSection>
      ) : null}

      {sections.guides && content ? (
        <BrandSection title={`${brand.name} rehberleri`}>
          <BrandGuides blogs={content.blogs} />
        </BrandSection>
      ) : null}

      {aboutParagraphs.length ? <BrandAbout name={brand.name} paragraphs={aboutParagraphs} /> : null}

      {otherBrands.length ? <OtherBrands brands={otherBrands} /> : null}
    </div>
  );
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { slug } = await params;
  const data = await getBrandPageData(slug);
  if (!data) return {};

  const { brand, content, indexable } = data;
  const title = content?.seo?.metaTitle || `${brand.name} Ürünleri`;
  const description =
    content?.seo?.metaDescription || content?.intro || fallbackIntro(brand.name, brand.productCount);
  const url = `${host}${brandPath(brand.slug)}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // Strapi içeriği girilmemiş marka sayfası ince içeriktir; indekslenmez (ADR-0003).
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${title} | Mitenya`,
      description,
      url,
      images: [{ url: '/static/images/ogBanner.webp', width: 1200, height: 630, alt: `${brand.name} | Mitenya` }],
    },
  };
};

// ADR-0003: ISR (ADR-0001 deseni). Sayfa ilk istekte üretilir ve cache'lenir;
// asıl tazelik webhook → revalidateTag('brand:<id>' / 'brand-content:<slug>').
// DİKKAT: force-static altında cookies()/headers() sessizce boş döner. Render
// ağacına istek-zamanlı veri EKLEME; gerekirse client island yap.
// `revalidate` statik analiz için literal olmalı; data.ts BRAND_REVALIDATE_SECONDS ile aynı tut.
export const dynamic = 'force-static';
export const revalidate = 3600;

export default BrandPage;
