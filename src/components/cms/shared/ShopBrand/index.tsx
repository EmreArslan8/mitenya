import Link from '@/components/common/Link';
import { BRAND_BOX_HEIGHT, BRAND_BOX_HEIGHT_HIGHLIGHT, brandLogoHeight } from '@/lib/shop/brandLogo';
import CMSImage from '../CMSImage';
import { SharedImageType } from '../cmsTypes';

interface BrandItemProps {
  logo: SharedImageType;
  url?: string;
  highlight?: boolean;
  alt?: string;
}

const BrandItem = ({ logo, url, highlight, alt }: BrandItemProps) => {
  const { url: src, alternativeText, width, height } = logo.data.attributes;
  const name = alt ?? alternativeText ?? 'Marka logosu';
  const boxHeight = highlight ? BRAND_BOX_HEIGHT_HIGHLIGHT : BRAND_BOX_HEIGHT;
  const logoHeight = Math.round(brandLogoHeight(boxHeight, width, height, name));
  const logoWidth = width && height ? Math.round(logoHeight * (width / height)) : logoHeight;
  const content = (
    <div
      style={{ height: boxHeight }}
      className={`flex items-center justify-center transition-[filter,opacity] duration-200 ${highlight ? 'opacity-100' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
    >
      <CMSImage src={src} alt={name} width={logoWidth} height={logoHeight} sizes={`${logoWidth}px`} style={{ width: logoWidth, height: logoHeight, objectFit: 'contain' }} />
    </div>
  );
  return url ? <Link href={url}>{content}</Link> : content;
};

export default BrandItem;
