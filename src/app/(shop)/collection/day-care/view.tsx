'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Droplets, Shield, Sparkles, Sun } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import { Select, SelectItem } from '@/components/ui/Select';
import { Collection, ShopSearchResponse, ShopSearchSort } from '@/lib/api/types';
import { UI_SORT_OPTIONS } from '@/lib/constants/shop';
import { cn } from '@/lib/utils/cn';

type DayCareViewProps = { initialData: ShopSearchResponse; collection: Collection };

const SORT_LABELS: Record<ShopSearchSort, string> = {
  rct: 'Önerilen', disc: 'İndirim Oranına Göre', pasc: 'Fiyat (Düşükten Yükseğe)',
  pdsc: 'Fiyat (Yüksekten Düşüğe)', rcc: 'Önerilen', bst: 'En Çok Satan',
  fav: 'En Favori', asc: 'Fiyat (Düşükten Yükseğe)', dsc: 'Fiyat (Yüksekten Düşüğe)',
};

const SunRay = ({ rotation, delay }: { rotation: number; delay: number }) => (
  <span aria-hidden className="absolute top-1/2 left-1/2 h-20 w-0.5 origin-top bg-[linear-gradient(180deg,rgba(255,200,100,0.6)_0%,transparent_100%)] animate-[day-ray-pulse_3s_ease-in-out_infinite] md:h-[120px]"
    style={{ '--ray-rotation': `${rotation}deg`, animationDelay: `${delay}s` } as CSSProperties} />
);

const FloatingBubble = ({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) => (
  <span aria-hidden className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9)_0%,rgba(255,220,150,0.3)_50%,transparent_70%)] shadow-[inset_0_-2px_4px_rgba(255,180,100,0.2)] animate-[day-bubble-rise_var(--bubble-duration)_ease-in-out_infinite]"
    style={{ left, top, width: size, height: size, animationDelay: `${delay}s`, '--bubble-duration': `${5 + delay}s` } as CSSProperties} />
);

const DayCareView = ({ initialData }: DayCareViewProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sort, setSort] = useState<ShopSearchSort>((searchParams?.get('sort') as ShopSearchSort) ?? 'rct');
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const products = initialData.products ?? [];
  const allowedUiSorts = UI_SORT_OPTIONS as readonly ShopSearchSort[];
  const visibleSortOptions = (initialData.sortOptions ?? ['rct', 'pdsc', 'pasc']).filter((option) => allowedUiSorts.includes(option));
  const selectedSort = visibleSortOptions.includes(sort) ? sort : (visibleSortOptions[0] ?? 'rct');

  useEffect(() => {
    setMounted(true);
    setSort((searchParams?.get('sort') as ShopSearchSort) ?? 'rct');
    setIsNavigating(false);
  }, [searchParams]);

  const handleSortChange = (value: ShopSearchSort) => {
    setSort(value);
    setIsNavigating(true);
    const params = new URLSearchParams(searchParams ?? undefined);
    if (value) params.set('sort', value);
    else params.delete('sort');
    params.delete('page');
    const query = params.toString();
    router.replace(query ? `?${query}` : '?');
  };

  return (
    <div className="min-h-screen bg-[#FFFBF5]">
      <section className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(255,200,100,0.5)_0%,transparent_50%),radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(255,180,120,0.25)_0%,transparent_50%),linear-gradient(180deg,#FFF8E8_0%,#FFFBF2_50%,#FFF_100%)] sm:min-h-[320px] md:min-h-[360px]">
        <div aria-hidden className="absolute -top-20 left-1/2 size-40 -translate-x-1/2 md:-top-[100px] md:size-[200px]">
          {Array.from({ length: 12 }, (_, index) => <SunRay key={index} rotation={index * 30} delay={index * 0.2} />)}
          <span className="absolute top-1/2 left-1/2 size-[60px] -translate-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,220,100,1)_0%,rgba(255,180,60,0.8)_50%,rgba(255,150,50,0.4)_100%)] shadow-[0_0_60px_rgba(255,180,100,0.6),0_0_120px_rgba(255,150,80,0.3)] animate-[day-sun-pulse_4s_ease-in-out_infinite] md:size-20" />
        </div>
        <FloatingBubble delay={0} size={12} left="15%" top="40%" />
        <FloatingBubble delay={1.2} size={8} left="80%" top="30%" />
        <FloatingBubble delay={0.6} size={16} left="65%" top="65%" />
        <FloatingBubble delay={1.8} size={10} left="25%" top="75%" />
        <span aria-hidden className="pointer-events-none absolute top-10 left-[15%] size-20 rounded-full bg-[radial-gradient(circle,rgba(255,230,180,0.4)_0%,transparent_70%)] blur-xl md:top-[60px] md:left-1/4 md:size-[100px]" />
        <div className={cn('relative z-[2] mt-8 max-w-[700px] px-6 text-center transition-opacity duration-1000 md:mt-10', mounted ? 'opacity-100' : 'opacity-0')}>
          <div className="mb-4 flex items-center justify-center gap-3 text-[#D97706]"><Sun size={16} /><span className="text-xs font-bold tracking-[3px]">ÖZEL KOLEKSİYON</span><Sparkles size={16} /></div>
          <h1 className="mb-3 bg-[linear-gradient(180deg,#1C1C1E_0%,#D97706_50%,#F59E0B_100%)] bg-clip-text text-[32px] leading-none font-extrabold text-transparent sm:text-[42px] md:text-[52px]">Günlük Bakım Koleksiyonu</h1>
          <p className="mb-3 text-[15px] font-medium tracking-[1px] text-[#92400E] sm:text-lg md:text-xl">Güne ışıldayarak başlayın</p>
          <p className="mb-5 hidden text-sm leading-[1.6] text-[rgba(60,40,20,0.7)] sm:block">SPF korumalı nemlendiriciler, aydınlatıcı serumlar ve hafif formüllerle<br />cildinizi gün boyu koruyun ve besleyin</p>
          <div className="hidden flex-wrap justify-center gap-6 sm:flex">
            {[[Shield, 'UV Koruma'], [Droplets, 'Hafif Nemlendirme'], [Sparkles, 'Aydınlatma']].map(([Icon, label]) => (
              <span key={label as string} className="flex items-center gap-2 text-sm font-semibold tracking-[0.5px] text-[#78350F]"><Icon size={18} className="text-[#FF9F43]" />{label as string}</span>
            ))}
          </div>
        </div>
      </section>
      <section className="relative z-[3] -mt-6 rounded-t-3xl bg-white px-3 py-6 shadow-[0_-10px_40px_rgba(255,180,100,0.1)] sm:rounded-t-[32px] sm:px-6 sm:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4"><span className="h-7 w-1 rounded bg-[linear-gradient(180deg,#F59E0B_0%,#D97706_100%)]" /><h2 className="text-2xl font-bold">{initialData.totalCount} Ürün</h2></div>
          <Select value={selectedSort} onValueChange={(value) => handleSortChange(value as ShopSearchSort)} aria-label="Sıralama" className="h-9 w-auto min-w-[160px] text-[13px]">
            {visibleSortOptions.map((option) => <SelectItem key={option} value={option}>{SORT_LABELS[option] ?? option}</SelectItem>)}
          </Select>
        </div>
        <ProductGrid>
          {products.map((product, index) => (
            <div key={product.url} className={cn('transition-opacity duration-[600ms] ease-in-out', mounted ? 'opacity-100' : 'opacity-0')} style={{ transitionDelay: `${index * 50}ms` }}><ProductCard data={product} /></div>
          ))}
          {isNavigating && Array.from({ length: 8 }, (_, index) => <ProductCardSkeleton key={index} />)}
        </ProductGrid>
      </section>
    </div>
  );
};

export default DayCareView;
