import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Ürün kartı ızgarası — ADR-0002 §11.0 anlamında **semantik bileşik**.
 *
 * Sakladığı karar: "bu sitede ürün listesi hangi kırılımda kaç sütun ve
 * hangi boşlukla dizilir". Sütun sayısını değiştirmek isteyen tek bu dosyayı
 * düzenler; daha önce aynı kararın 3 ayrı kopyası vardı ve ayrışmışlardı:
 *
 *   category · collection/day-care · collection/night-care   xs=6 sm=4 md=3  (2/3/4)
 *   search                                                   xs=6 sm=4 md=4  (2/3/3)
 *   cms/blocks/ShopInlineProducts                            xs=6 md=3       (2/2/4)
 *
 * İlk ikisi arasındaki fark GERÇEK bir tasarım gerekçesine dayanıyor: arama
 * sayfası `TwoColumnLayout` içinde, yanında filtre sütunu var — dar alana 4
 * kart sığmıyor. Bu yüzden `layout` prop'u görünümü değil **sebebi** adlandırır.
 *
 * `ShopInlineProducts` bilerek DIŞARIDA bırakıldı: hem sütun (sm'de 2) hem
 * boşluk (16/32px) farklı. Kanonik düzene çekmek görsel bir değişiklik olur;
 * bu bir ürün kararıdır, sessizce yapılmaz. Faz 4'te sorulacak.
 *
 * Boşluklar MUI karşılığından ölçüldü (konvansiyon.md §1):
 *   columnSpacing 2.5 = 20px -> gap-x-5 · rowSpacing 3 = 24px -> gap-y-6
 *
 * DİKKAT (konvansiyon.md §7): MUI Grid negatif margin + padding ile çalışıyordu,
 * CSS grid `gap` ile değil. Dış kenarlarda ufak hizalama farkı beklenebilir;
 * her dönüşüm 3 kırılımda karşılaştırılmalı.
 */

const LAYOUT = {
  /** Tam genişlik sayfa: kategori, koleksiyon. */
  full: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
  /** Yanında filtre/kenar sütunu olan sayfa: arama. */
  withSidebar: 'grid-cols-2 sm:grid-cols-3',
} as const;

export type ProductGridProps = {
  layout?: keyof typeof LAYOUT;
  children: ReactNode;
  className?: string;
};

export function ProductGrid({ layout = 'full', children, className }: ProductGridProps) {
  return (
    <div className={cn('grid gap-x-5 gap-y-6', LAYOUT[layout], className)}>{children}</div>
  );
}

export default ProductGrid;
