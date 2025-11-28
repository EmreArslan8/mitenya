// src/components/shared/ShopSliderCard/index.tsx

import Link from '@/components/common/Link';
import useScreen from '@/lib/hooks/useScreen';
import { Box, Stack, Typography } from '@mui/material'; // Stack yerine Box kullanıyoruz
import CMSImage from '../CMSImage';
import { SharedImageType } from '../cmsTypes';
import useStyles from './styles';

export interface ShopSliderCardProps {
  image: SharedImageType;
  url?: string | null;
  label?: string | null;
  title?: string | null; 
}


const ShopSliderCard = ({ url, image, label, title }: ShopSliderCardProps) => {
  const styles = useStyles();
  // useScreen kullanımı artık gerekmiyor, çünkü stiller responsive.
  
  if (!image) return null;

  // Görseldeki gibi Link, kart container'ını sarmalamalı.
  return (
    <Link href={url} >
      <Box sx={styles.cardContainer}>
        {/* Resim: Kapsayıcıyı tam doldurmalı (fill) */}
        <CMSImage
          src={image.data.attributes.url}
          alt={title || 'Kaydırıcı Görseli'}
          fill 
          style={{ 
            objectFit: 'cover', // Görüntüyü cardContainer'ı dolduracak şekilde sığdır
          }}
        />

        {/* Overlay (Metin Okunurluğu İçin) */}
        <Box sx={styles.overlay} />

        {/* Başlık (Görüntünün Üzerinde Ortada) */}
        {title && (
          <Typography variant="h4" sx={styles.title}>
            {title}
          </Typography>
        )}
        
        {/* Label (Görselde Yok, Ama Dilerseniz Ekleyebilirsiniz) */}
        {/*
        {label && (
          <Typography variant="caption" sx={styles.label}>
            {label}
          </Typography>
        )}
        */}
      </Box>
    </Link>
  );
};

export default ShopSliderCard;