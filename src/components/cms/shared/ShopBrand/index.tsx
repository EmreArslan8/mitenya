import { Box } from '@mui/material';
import Link from '@/components/common/Link';
import {
  BRAND_BOX_HEIGHT,
  BRAND_BOX_HEIGHT_HIGHLIGHT,
  brandLogoHeight,
} from '@/lib/shop/brandLogo';
import CMSImage from '../CMSImage';
import useStyles from './styles';
import { SharedImageType } from '../cmsTypes';

interface BrandItemProps {
  logo: SharedImageType;
  url?: string;
  highlight?: boolean;
  alt?: string;
}

const BrandItem = ({ logo, url, highlight, alt }: BrandItemProps) => {
  const styles = useStyles();
  const { url: src, alternativeText, width, height } = logo.data.attributes;
  const name = alt ?? alternativeText ?? 'Marka logosu';

  // Kutu tüm logolar için sabit; logo kutunun İÇİNE oturur, kutuyu zorlamaz.
  const boxHeight = highlight ? BRAND_BOX_HEIGHT_HIGHLIGHT : BRAND_BOX_HEIGHT;
  // Yükseklik logonun oranından türetilir (bkz. lib/shop/brandLogo)
  const logoHeight = Math.round(brandLogoHeight(boxHeight, width, height, name));
  const logoWidth = width && height ? Math.round(logoHeight * (width / height)) : logoHeight;

  const content = (
    <Box sx={{ ...styles.root, ...(highlight ? styles.highlight : null), height: boxHeight }}>
      <CMSImage
        src={src}
        alt={name}
        width={logoWidth}
        height={logoHeight}
        sizes={`${logoWidth}px`}
        style={{ width: logoWidth, height: logoHeight, objectFit: 'contain' }}
      />
    </Box>
  );

  return url ? <Link href={url}>{content}</Link> : content;
};

export default BrandItem;
