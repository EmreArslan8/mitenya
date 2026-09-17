import DOMPurify from 'isomorphic-dompurify';
import NextImage from 'next/image';
import Link from '@/components/common/Link';
import BlogCard from '@/components/cms/shared/BlogCard';
import type { BrandContent } from '@/lib/api/cmsBrand';
import type { BrandSummary } from '@/lib/api/supabaseBrand';
import { brandPath } from '@/lib/shop/brandPath';
import type { RoutineStepView } from '../model';

/**
 * Marka sayfasının içerik bölümleri (Strapi'den). Hepsi server component;
 * boş veriyle çağrılmaz — hangi bölümün çizileceğine page.tsx karar verir.
 */

const toPlainText = (value?: string | null) =>
  DOMPurify.sanitize(value ?? '', { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();

export const BrandIngredients = ({ items }: { items: BrandContent['ingredients'] }) => (
  <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
    {items.map((item) => (
      <li
        key={item.title}
        className="flex min-h-[170px] flex-col justify-between gap-2 rounded-2xl border border-gray-100 bg-bg-light p-4 md:min-h-[210px] md:p-7"
      >
        {item.eyebrow ? <span className="text-xs font-semibold text-green md:text-[13px]">{item.eyebrow}</span> : <span />}
        <div className="flex flex-col gap-1 md:gap-2">
          <h3 className="text-lg font-semibold md:text-2xl">{item.title}</h3>
          {item.description ? (
            <p className="text-[13px] leading-snug text-text-medium md:text-[15px]">{item.description}</p>
          ) : null}
        </div>
      </li>
    ))}
  </ul>
);

export const BrandComparison = ({ table }: { table: NonNullable<BrandContent['comparison']> }) => {
  const hasThirdColumn = Boolean(table.columnC);
  const columns = [table.columnA, table.columnB, ...(hasThirdColumn ? [table.columnC as string] : [])];

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 md:rounded-3xl">
      <table className="w-full min-w-[340px] table-fixed border-collapse text-sm md:text-base">
        <thead className="bg-bg-light text-left">
          <tr>
            <th scope="col" className="w-[30%] p-3 font-medium text-text-medium-light md:w-[28%] md:px-7 md:py-5">
              Özellik
            </th>
            {columns.map((column) => (
              <th key={column} scope="col" className="p-3 font-bold md:px-7 md:py-5">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.label} className="border-t border-gray-100">
              <th scope="row" className="p-3 text-left font-normal text-text-medium-light md:px-7 md:py-[18px]">{row.label}</th>
              <td className="p-3 md:px-7 md:py-[18px]">{row.valueA}</td>
              <td className="p-3 md:px-7 md:py-[18px]">{row.valueB}</td>
              {hasThirdColumn ? <td className="p-3 md:px-7 md:py-[18px]">{row.valueC ?? '—'}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const BrandRoutine = ({ steps }: { steps: RoutineStepView[] }) => (
  <ol className="flex flex-col gap-2 md:grid md:grid-cols-5 md:gap-3">
    {steps.map((step, index) => {
      const hasProducts = step.products.length > 0;
      const firstImage = step.products[0]?.images?.[0]?.originalUrl || step.products[0]?.imgSrc;

      return (
        <li
          key={step.title}
          className={
            hasProducts
              ? 'flex items-center gap-3 rounded-2xl border border-gray-200 bg-bg p-3.5 md:min-h-[360px] md:flex-col md:items-stretch md:p-5'
              : 'flex items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-bg-light p-3.5 md:min-h-[360px] md:flex-col md:items-stretch md:p-5'
          }
        >
          <div className="flex items-center justify-between md:w-full">
            <span
              className={
                hasProducts
                  ? 'flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-contrast-text md:size-9'
                  : 'flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-text-medium-light md:size-9'
              }
            >
              {index + 1}
            </span>
            <span className="hidden text-[13px] font-semibold text-text-medium-light md:inline">{step.timing}</span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:gap-3">
            <h3 className="font-semibold md:text-xl">
              {step.title} <span className="text-xs font-medium text-text-medium-light md:hidden">· {step.timing}</span>
            </h3>

            {hasProducts ? (
              <>
                {firstImage ? (
                  <div className="relative hidden h-[130px] md:block">
                    <NextImage src={firstImage} alt="" fill sizes="220px" className="object-contain mix-blend-multiply" />
                  </div>
                ) : null}
                <ul className="flex flex-col gap-1">
                  {step.products.map((product) => (
                    <li key={product.id}>
                      <Link href={product.url} className="text-sm underline md:font-semibold md:no-underline md:hover:underline">
                        {product.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : step.fallback ? (
              <div className="flex flex-col gap-2 md:mt-auto">
                <span className="hidden text-[15px] text-text-medium-light md:inline">Bu markada bu adım yok.</span>
                <Link href={step.fallback.url} className="text-sm underline md:text-[15px] md:font-semibold">
                  {step.fallback.label}
                </Link>
              </div>
            ) : null}
          </div>
        </li>
      );
    })}
  </ol>
);

export const BrandFaq = ({ items }: { items: BrandContent['faqs'] }) => (
  <div className="flex flex-col">
    {items.map((item, index) => (
      <details key={item.title} open={index === 0} className="group border-b border-gray-100 py-4 md:py-[22px]">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold md:text-lg [&::-webkit-details-marker]:hidden">
          {item.title}
          <span aria-hidden="true" className="text-xl text-text-light transition-transform group-open:rotate-45">+</span>
        </summary>
        <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-text-medium md:text-base">
          {toPlainText(item.description)}
        </p>
      </details>
    ))}
  </div>
);

export const BrandGuides = ({ blogs }: { blogs: BrandContent['blogs'] }) => (
  <ul className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-5">
    {blogs.slice(0, 3).map((blog) => (
      <li key={blog.slug}>
        <BlogCard
          slug={blog.slug}
          title={blog.title}
          excerpt={blog.excerpt ?? undefined}
          publishedAt={blog.publishDate ?? undefined}
          coverImage={blog.cover?.data?.attributes}
        />
      </li>
    ))}
  </ul>
);

/**
 * Uzun marka metni. Mobilde ilk paragraftan sonrası CSS ile katlanır; metnin
 * tamamı HTML'de kalır (arama motoru okur). JS yok.
 */
export const BrandAbout = ({ name, paragraphs }: { name: string; paragraphs: string[] }) => (
  <section aria-labelledby="hakkinda-title" className="flex flex-col gap-3 border-t border-gray-100 pt-7 md:flex-row md:gap-16 md:pt-12">
    <h2 id="hakkinda-title" className="text-xl font-semibold md:w-[360px] md:shrink-0 md:text-[28px]">
      {name} hakkında
    </h2>
    <div className="flex flex-col gap-4 text-sm leading-[1.75] text-text-medium md:text-base">
      <input id="brand-about-toggle" type="checkbox" className="peer sr-only" />
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={index === 0 ? undefined : 'hidden peer-checked:block md:block'}>
          {paragraph}
        </p>
      ))}
      {paragraphs.length > 1 ? (
        <label
          htmlFor="brand-about-toggle"
          className="flex h-11 cursor-pointer items-center self-start font-semibold underline peer-checked:hidden peer-focus-visible:outline-2 md:hidden"
        >
          Devamını oku
        </label>
      ) : null}
    </div>
  </section>
);

export const OtherBrands = ({ brands }: { brands: BrandSummary[] }) => (
  <section aria-labelledby="diger-markalar-title" className="-mx-2 flex flex-col gap-3.5 bg-gray-50 px-4 py-7 md:mx-0 md:gap-5 md:rounded-3xl md:px-16 md:py-12">
    <h2 id="diger-markalar-title" className="text-[13px] font-semibold tracking-[0.08em] text-text-medium-light uppercase md:text-[15px]">
      Diğer markalar
    </h2>
    <ul className="flex flex-wrap gap-2 md:gap-3">
      {brands.map((brand) => (
        <li key={brand.id}>
          <Link
            href={brandPath(brand.slug)}
            className="flex h-11 items-center rounded-full bg-bg px-[18px] text-sm font-semibold hover:bg-primary hover:text-primary-contrast-text md:h-14 md:px-7 md:text-base"
          >
            {brand.name}
          </Link>
        </li>
      ))}
    </ul>
  </section>
);
