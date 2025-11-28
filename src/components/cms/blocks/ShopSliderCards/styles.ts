// src/components/blocks/HorizontalMediaSlider/styles.ts
// VEYA src/components/shared/ShopSliderCard/styles.ts (Hangisi merkezi stil dosyanızsa)

import { withPalette } from '@/theme/ThemeRegistry';
import { Theme } from '@mui/material';

const useStyles = withPalette((palette) => ({
  
  // SLAYTLAR ARASINDAKİ BOŞLUK İÇİN KULLANILACAK STİL
  // ShopSliderCards (Yönetici Bileşen) içinde, her bir ShopSliderCard'ı saran Box için kullanılır.
  slideWrapper: {
    // 💡 Her bir slaytın sağına boşluk ekleyerek kartlar arasındaki yatay mesafeyi yaratır.
    paddingRight: { xs: '8px', sm: '16px' }, 
  },
  
  // KARTIN ANA CONTAINER STİLİ (ShopSliderCard içinde kullanılır)
  cardContainer: {
    // Görseldeki gibi büyük bir kart yüksekliği tanımlayalım
    height: { xs: '200px', sm: '300px' }, 
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative', // Başlık için konumlandırma
    cursor: 'pointer',
    
    // Hover Efekti
    transition: 'transform 0.3s ease', 
    '&:hover': {
      transform: 'scale(1.02)', 
    },
  },
  
  // Resmin üzerine gelen hafif siyah overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // Hafif bir karartma
    zIndex: 1, 
  },

  // Başlık metni stili (Görüntünün ortasında, büyük ve beyaz)
  title: {
    position: 'absolute',
    zIndex: 2, // Resim ve overlay'in üstünde
    fontSize: { xs: '20px', sm: '32px' }, 
    fontWeight: 700,
    lineHeight: 1.1,
    color: palette.white, 
    textAlign: 'center',
    padding: '0 16px',
    textShadow: `0px 2px 4px ${palette.bg}cc`, 
    maxWidth: '90%',
  },
  
  // Label veya caption görselde kullanılmadığı için minimal stil bırakılmıştır.
  label: {
    display: 'none', 
  },
}));

export default useStyles;