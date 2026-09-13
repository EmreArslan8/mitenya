'use client';
import { Rating } from '@/components/ui/Rating';



// Küçük client island: MUI Rating (kesirli 0.1 yıldız). Birebir görsel korunsun diye
// CSS'e port edilmedi; yalnız yıldızlar hydrate olur, çevresindeki metin/anchor RSC.

const ProductRatingStars = ({ value }: { value: number }) => (
  <Rating value={value} className="text-[15px] sm:text-[18px]" />
);

export default ProductRatingStars;
