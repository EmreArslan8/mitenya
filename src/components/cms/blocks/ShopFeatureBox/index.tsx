import Button from '@/components/ui/Button';
import Markdown from '@/components/common/Markdown';
import { cn } from '@/lib/utils/cn';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import CMSImage from '../../shared/CMSImage';
import { SharedButtonType, SharedImageType } from '../../shared/cmsTypes';

export interface ShopFeatureBoxProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  title?: string;
  description?: string;
  image: SharedImageType;
  imagePosition: 'start' | 'end';
  imageFit: 'cover' | 'contain';
  button?: SharedButtonType;
}

const ShopFeatureBox = ({ section, title, description, image, imagePosition, imageFit, button }: ShopFeatureBoxProps) => (
  <SectionBase {...section}>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
      <div className={cn('relative min-h-[200px] w-full sm:min-h-[300px] md:min-h-[500px]', imagePosition === 'end' && 'sm:order-2')}>
        <CMSImage src={image.data.attributes.url} alt={image.data.attributes.alternativeText || title || 'Mitenya'} fill sizes="(min-width: 600px) 50vw, 100vw" className={cn('rounded-lg border border-text-light', imageFit === 'contain' ? 'object-contain p-4' : 'object-cover')} />
      </div>
      <div className="flex flex-col items-start gap-2">
        {title ? <h2 className="text-3xl font-bold">{title}</h2> : null}
        {description ? <Markdown text={description} /> : null}
        {button ? <Button size="small" className="mt-4 self-center" variant="tonal" href={button.href} target={button.target as '_blank' | '_self' | undefined} arrow={button.arrow === 'none' ? undefined : button.arrow} dataLayerEventId={button.dataLayerEventId}>{button.label}</Button> : null}
      </div>
    </div>
  </SectionBase>
);

export default ShopFeatureBox;
