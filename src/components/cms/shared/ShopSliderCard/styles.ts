// src/components/shared/ShopSliderCard/styles.ts (VEYA HorizontalMediaSlider/styles.ts)

import { withPalette } from '@/theme/ThemeRegistry';

const useStyles = withPalette((palette) => ({
  // Kartın ana container'ı: Genişliği, yüksekliği ve yuvarlak köşeleri yönetir.
  cardContainer: {
    // Görseldeki gibi büyük bir kart yüksekliği tanımlayalım
    height: { xs: '200px', sm: '276px' }, 
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative', // Başlık için konumlandırma
    cursor: 'pointer',

    // Gelişmiş Hover Efekti (isteğe bağlı, görselde yok ama kullanıcı deneyimini artırır)
    transition: 'transform 0.3s ease', 
    '&:hover': {
      transform: 'scale(1.02)', 
    },
  },
  
  // Başlık metni stili (Görüntünün ortasında, büyük ve beyaz)
  title: {
    position: 'absolute',
    zIndex: 2, // Resim ve overlay'in üstünde
    fontSize: { xs: '20px', sm: '32px' }, // Resimdeki gibi büyük font
    fontWeight: 700,
    lineHeight: 1.1,
    color: palette.white, // Beyaz metin
    textAlign: 'center',
    padding: '0 16px',
    // Metin okunurluğunu artırmak için gölge ekle
    textShadow: `0px 2px 4px`, 
  },
  
  // (Label/Caption Görselde Olmadığı İçin Stilini Yorum Satırında Bıraktım)
  label: {
    display: 'none', // Görseldeki tasarıma uymak için gizlenebilir
  },
  
  // Slaytlar arası yatay boşluk (HorizontalMediaSlider'da kullanılacak)
  slideWrapper: {
    paddingRight: { xs: '8px', sm: '12px' },
  },
  
  // Resmin üzerine gelen hafif siyah overlay (metni okunaklı yapmak için)
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)', // Hafif bir karartma
    zIndex: 1, 
  },
}));

export default useStyles;