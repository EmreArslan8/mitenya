import Image from 'next/image';

interface CMSImageProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}

const CMSImage = ({ src, alt, sizes = '100vw', ...props }: CMSImageProps) => {
  alt ??= '';
  return (
    <Image
      src={
        src.indexOf('https://') !== -1 || src.indexOf('http://') !== -1
          ? src
          : `${process.env.NEXT_PUBLIC_IMAGE_HOST}${src}`
      }
      alt={alt}
      {...props}
      sizes={sizes}
    />
  );
};

export default CMSImage;
