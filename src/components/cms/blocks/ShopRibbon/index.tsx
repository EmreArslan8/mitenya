import Button from '@/components/ui/Button';
import Markdown from '@/components/common/Markdown';
import { cn } from '@/lib/utils/cn';
import { BlockComponentBaseProps } from '..';
import CMSImage from '../../shared/CMSImage';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedButtonType, SharedImageType } from '../../shared/cmsTypes';

export interface ShopRibbonProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  image?: SharedImageType;
  title: string;
  description: string;
  colorway: 'primary' | 'info' | 'success' | 'error' | 'warning';
  button?: SharedButtonType;
}

const COLORWAYS = {
  primary: 'bg-[image:var(--gradient-primary)] text-primary-contrast-text',
  info: 'bg-[image:var(--gradient-info)] text-info-contrast-text',
  success: 'bg-[image:var(--gradient-success)] text-success-contrast-text',
  error: 'bg-[image:var(--gradient-error)] text-error-contrast-text',
  warning: 'bg-[image:var(--gradient-warning)] text-warning-contrast-text',
} as const;

const ShopRibbon = ({ section, image, title, description, colorway, button }: ShopRibbonProps) => (
  <SectionBase {...section}>
    <div className={cn('relative -my-4 flex min-h-[100px] items-center rounded-xl', COLORWAYS[colorway])}>
      {image?.data ? <CMSImage fill src={image.data.attributes.url} alt={image.data.attributes.alternativeText || title} className="z-0 rounded-xl object-cover" sizes="1200px" /> : null}
      <div className="z-1 flex w-full flex-col items-center gap-2 px-2 py-4 text-center sm:px-4 sm:py-6">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold sm:text-[2.5rem]">{title}</h2>
          <Markdown text={description} className="[&_a]:!underline" />
        </div>
        {button ? <Button color={colorway === 'primary' || colorway === 'error' ? colorway : 'neutral'} variant={button.variant} arrow={button.arrow === 'none' ? undefined : button.arrow} href={button.href} target={button.target as '_blank' | '_self' | undefined} dataLayerEventId={button.dataLayerEventId} size="small">{button.label}</Button> : null}
      </div>
    </div>
  </SectionBase>
);

export default ShopRibbon;
