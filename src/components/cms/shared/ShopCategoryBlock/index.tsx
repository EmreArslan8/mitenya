import Link from '@/components/common/Link';
import CMSImage from '../CMSImage';
import { SharedImageType } from '../cmsTypes';

export interface ShopCategoryBlockProps {
  image: SharedImageType;
  title: string;
  label?: string;
  href: string;
  buttonLabel?: string;
  target?: '_self' | '_blank';
  index?: number;
  variant?: 'default' | 'featured';
}

const ShopCategoryBlock = ({ image, title, label, href, buttonLabel, target = '_self', index = 0 }: ShopCategoryBlockProps) => (
  <Link href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} style={{ display: 'block', height: '100%', color: 'inherit', textDecoration: 'none' }}>
    <article className="group relative isolate h-full min-h-[430px] cursor-pointer overflow-hidden bg-text shadow-[0_1px_0_rgba(28,24,21,0.08)] transition-[transform,box-shadow] duration-300 hover:-translate-y-[5px] hover:shadow-[0_22px_48px_rgba(28,24,21,0.16)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-[460px] lg:min-h-[420px]">
      {image?.data ? (
        <div className="absolute inset-0 -z-2 overflow-hidden bg-gray-100 after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(17,17,17,0.02)_28%,rgba(17,17,17,0.18)_54%,rgba(17,17,17,0.88)_100%)]">
          <CMSImage src={image.data.attributes.url} alt={image.data.attributes.alternativeText || title} fill sizes="(min-width:1200px) 20vw, (min-width:600px) 50vw, 82vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.055] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
        </div>
      ) : null}
      <p className="absolute left-4 top-4 rounded-full border border-white/45 bg-white/15 px-2.5 py-[4.8px] text-[11px] font-bold leading-none tracking-[0.12em] text-white backdrop-blur-[10px]">{String(index + 1).padStart(2, '0')}</p>
      <div className="flex h-full min-h-[inherit] flex-col justify-end gap-1.5 p-5 text-white md:p-[18px]">
        <h3 className="text-[25px] font-medium leading-[1.05] tracking-[-0.025em] md:text-[27px]">{title}</h3>
        {label ? <p className="max-w-[250px] text-sm leading-[1.45] text-white/[78%] lg:text-[13px]">{label}</p> : null}
        <div className="mt-2.5 flex flex-row items-center justify-between gap-2 border-t border-white/30 pt-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">{buttonLabel || 'Ürünleri keşfet'}</p>
          <span aria-hidden="true" className="text-lg leading-none text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
        </div>
      </div>
    </article>
  </Link>
);

export default ShopCategoryBlock;
