import SectionBase, { SectionBaseProps } from '@/components/cms/shared/SectionBase';
import type { BlockComponentBaseProps } from '..';

type StatItem = { value: string; label: string };

export interface ProductDetailClinicalStatsProps extends BlockComponentBaseProps {
  section?: SectionBaseProps;
  eyebrow?: string;
  title: string;
  description?: string;
  stats: StatItem[];
}

const ProductDetailClinicalStats = ({ section, eyebrow, title, description, stats }: ProductDetailClinicalStatsProps) => {
  if (!title || !stats.length) return null;

  return (
    <SectionBase {...(section ?? {})} className="max-w-full px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-6 py-6 md:gap-8 md:py-9">
        <div className="flex min-w-0 flex-col justify-center gap-2 md:gap-2.5">
          {eyebrow ? <p className="text-xs font-bold uppercase leading-[1.3] tracking-[0.2em] text-[rgb(111,103,95)]">{eyebrow}</p> : null}
          <h2 className="text-2xl font-medium uppercase leading-7 tracking-[-0.05em] text-text sm:text-4xl sm:leading-10">{title}</h2>
          {description ? <p className="text-sm leading-[1.62] text-[rgb(111,105,99)] md:text-base">{description}</p> : null}
        </div>
        <div className="grid grid-cols-1 items-start gap-x-5 gap-y-4 pt-2 sm:grid-cols-2 md:grid-cols-3 md:gap-x-8 md:gap-y-6 md:pt-3">
          {stats.map((item, index) => (
            <div key={`${item.value}-${index}`} className="flex w-full flex-col self-start gap-[2.8px] md:min-h-[92px] md:[&:nth-of-type(n+4)]:ml-[18%]">
              <p className="w-fit border-b-[1.5px] border-black/[68%] pb-[1.6px] text-[23px] font-bold leading-none tracking-[-0.04em] text-text md:text-[27px]">{item.value}</p>
              <p className="max-w-60 text-[13px] leading-normal text-[rgb(111,105,99)] md:text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionBase>
  );
};

export default ProductDetailClinicalStats;
