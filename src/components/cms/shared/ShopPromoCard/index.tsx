import Link from '@/components/common/Link';
import CMSImage from '../CMSImage';
import { SharedImageType } from '../cmsTypes';
import { SectionBaseProps } from '../SectionBase';

export interface ShopPromoCardProps {
  section?: SectionBaseProps;
  image: SharedImageType;
  title: string;
  description?: string;
  label?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

const ShopPromoCard = ({ image, title, description, label, buttonLabel, buttonHref }: ShopPromoCardProps) => (
  <Link href={buttonHref} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
    <article className="group relative aspect-[1.45] h-full w-full overflow-hidden sm:aspect-[1.7] md:aspect-[1.6] md:max-h-[440px]">
      <CMSImage src={image?.data?.attributes?.url} alt={image?.data?.attributes?.alternativeText || title} fill sizes="(min-width:900px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
      <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-[linear-gradient(180deg,rgba(0,0,0,0)_45%,rgba(0,0,0,0.55)_100%)] p-6 text-white md:p-9">
        {label ? <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-85">{label}</p> : null}
        <h3 className="text-2xl font-semibold leading-[1.1] tracking-[-0.01em] md:text-[32px]">{title}</h3>
        {description ? <p className="max-w-[420px] text-sm leading-normal opacity-90 md:text-[15px]">{description}</p> : null}
        {buttonLabel ? <p className="mt-1 text-[13px] font-semibold uppercase tracking-[0.04em] underline underline-offset-4">{buttonLabel}</p> : null}
      </div>
    </article>
  </Link>
);

export default ShopPromoCard;
