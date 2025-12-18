import Link from '@/components/common/Link';
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

  const content = (
    <CMSImage
      src={logo.data.attributes.url}
      alt={alt ?? 'brand logo'}
      width={highlight ? 180 : 130}
      height={48}
      style={{
        opacity: highlight ? 1 : 0.7,
        transition: 'opacity .2s ease',
      }}
    />
  );

  return url ? <Link href={url}>{content}</Link> : content;
};

export default BrandItem;
