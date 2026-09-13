import Link from '@/components/common/Link';
import CMSImage from '../CMSImage';
import { SharedImageType } from '../cmsTypes';

export interface ShopBadgeButtonProps {
  image: SharedImageType;
  url?: string | null;
  label?: string | null;
  title?: string | null;
}

const ShopBadgeButton = ({ url, image, label, title }: ShopBadgeButtonProps) => {
  if (!image) return null;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex justify-center p-2 transition-transform duration-300 hover:scale-105 sm:p-3">
        <Link href={url}>
          <CMSImage
            src={image.data.attributes.url}
            alt={image.data.attributes.alternativeText}
            width={200}
            height={200}
            sizes="(max-width: 599px) 100px, 200px"
            className="h-[100px] w-[100px] rounded-full object-contain sm:h-[200px] sm:w-[200px]"
          />
        </Link>
      </div>
      {title ? <p className="text-center text-xs font-semibold leading-[1.2] text-primary-deep-dark sm:text-base">{title}</p> : null}
      {label ? <p className="mt-2 text-center text-[10px] font-medium leading-none text-primary-deep-dark sm:text-sm">{label}</p> : null}
    </div>
  );
};

export default ShopBadgeButton;
