import Link from '@/components/common/Link';
import CMSImage from '../CMSImage';
import { SharedImageType } from '../cmsTypes';

export interface ShopSliderCardProps {
  image: SharedImageType;
  url?: string | null;
  label?: string | null;
  title?: string | null;
}

const ShopSliderCard = ({ url, image, title }: ShopSliderCardProps) => {
  if (!image) return null;
  return (
    <Link href={url}>
      <article className="relative h-[200px] cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:scale-[1.02] sm:h-[276px]">
        <CMSImage src={image.data.attributes.url} alt={title || 'Kaydırıcı Görseli'} fill sizes="(min-width: 1200px) 320px, (min-width: 600px) 40vw, 82vw" style={{ objectFit: 'cover' }} />
        <div className="absolute inset-0 z-1 bg-black/15" />
        {title ? <h3 className="absolute inset-0 z-2 flex items-center justify-center px-4 text-center text-xl font-bold leading-[1.1] text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.35)] sm:text-[32px]">{title}</h3> : null}
      </article>
    </Link>
  );
};

export default ShopSliderCard;
