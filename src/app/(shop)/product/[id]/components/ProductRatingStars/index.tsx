'use client';

import { Rating } from '@mui/material';

// Küçük client island: MUI Rating (kesirli 0.1 yıldız). Birebir görsel korunsun diye
// CSS'e port edilmedi; yalnız yıldızlar hydrate olur, çevresindeki metin/anchor RSC.

const ProductRatingStars = ({ value }: { value: number }) => (
  <Rating
    readOnly
    precision={0.1}
    value={value}
    sx={{ fontSize: { xs: 15, sm: 18 }, display: 'flex', alignItems: 'center' }}
  />
);

export default ProductRatingStars;
