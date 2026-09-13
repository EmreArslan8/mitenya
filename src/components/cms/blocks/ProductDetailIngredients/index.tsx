import CMSImage from '@/components/cms/shared/CMSImage';
import { SharedImageType } from '@/components/cms/shared/cmsTypes';
import SectionBase, { SectionBaseProps } from '@/components/cms/shared/SectionBase';
import type { BlockComponentBaseProps } from '..';

export interface ProductDetailIngredientsProps extends BlockComponentBaseProps {
  section?: SectionBaseProps;
  items: {
    eyebrow?: string;
    title: string;
    description?: string;
    image: SharedImageType;
  }[];
}

const ProductDetailIngredients = ({ section, items }: ProductDetailIngredientsProps) => {
  const validItems = items.filter((item) => item.image?.data?.attributes?.url);
  if (!validItems.length) return null;

  return (
    <SectionBase {...(section ?? {})} className="mt-8 md:mt-12">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
        {validItems.map((item, index) => (
          <article
            key={`${item.title}-${index}`}
            className="relative min-h-[280px] aspect-square overflow-hidden bg-[rgb(243,241,237)] shadow-[0_10px_24px_rgba(15,23,42,0.05)] md:min-h-80 md:aspect-[0.96/1]"
          >
            <div className="absolute inset-0 bg-gray-50">
              <CMSImage
                src={item.image.data.attributes.url}
                alt={item.image.data.attributes.alternativeText || item.title}
                fill
                sizes="(min-width: 768px) 33vw, (min-width: 600px) 50vw, 100vw"
                style={{ objectFit: 'cover' }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,12,0.01)_0%,rgba(12,12,12,0.08)_52%,rgba(12,12,12,0.44)_100%)]" />
            </div>
            <div className="absolute inset-x-0 bottom-0 z-1 flex flex-col items-start justify-end gap-[1.6px] px-4 py-5">
              {item.eyebrow ? (
                <p className="mb-2.5 text-[9px] font-medium leading-[1.15] text-white md:text-[10.5px]">{item.eyebrow}</p>
              ) : null}
              <h3 className="text-[15px] font-bold leading-[1.08] tracking-[-0.03em] text-white md:text-lg">{item.title}</h3>
              {item.description ? <p className="hidden">{item.description}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </SectionBase>
  );
};

export default ProductDetailIngredients;
