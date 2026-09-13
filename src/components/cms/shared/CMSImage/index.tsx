import Image from 'next/image';

interface CMSImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'lazy' | 'eager';
  unoptimized?: boolean;
  quality?: number;
  style?: React.CSSProperties;
  className?: string;
}

const CMSImage = ({ src, alt, width, sizes, unoptimized, ...props }: CMSImageProps) => {
  alt ??= '';
  const resolvedSrc =
    src.indexOf('https://') !== -1 || src.indexOf('http://') !== -1
      ? src
      : `${process.env.NEXT_PUBLIC_IMAGE_HOST}${src}`;
  const isSvg = resolvedSrc.split('?')[0].toLowerCase().endsWith('.svg');
  const hasResponsiveCdn =
    resolvedSrc.includes('res.cloudinary.com') || resolvedSrc.includes('cdn.mitenya.com');

  return (
    <Image
      src={resolvedSrc}
      alt={alt}
      width={width}
      {...props}
      sizes={sizes ?? (width ? `${width}px` : '100vw')}
      unoptimized={unoptimized ?? (isSvg || !hasResponsiveCdn)}
    />
  );
};

export default CMSImage;
