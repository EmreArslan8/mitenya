'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronRight, Home, Moon, Sparkles, Stars } from '@/components/icons';
import Link from '@/components/common/Link';
import ProductCard, { ProductCardSkeleton } from '@/components/ProductCard';
import ProductGrid from '@/components/ProductGrid';
import { Select, SelectItem } from '@/components/ui/Select';
import { Collection, ShopSearchResponse, ShopSearchSort } from '@/lib/api/types';
import { UI_SORT_OPTIONS } from '@/lib/constants/shop';
import { cn } from '@/lib/utils/cn';

type NightCareViewProps = { initialData: ShopSearchResponse; collection: Collection };

const SORT_LABELS: Record<ShopSearchSort, string> = {
  rct: 'Önerilen', disc: 'İndirim Oranına Göre', pasc: 'Fiyat (Düşükten Yükseğe)',
  pdsc: 'Fiyat (Yüksekten Düşüğe)', rcc: 'Önerilen', bst: 'En Çok Satan',
  fav: 'En Favori', asc: 'Fiyat (Düşükten Yükseğe)', dsc: 'Fiyat (Yüksekten Düşüğe)',
};

const PARTICLES = Array.from({ length: 30 }, (_, index) => ({
  left: `${(index * 37 + 11) % 100}%`,
  top: `${(index * 61 + 7) % 100}%`,
  delay: `${((index * 17) % 30) / 10}s`,
  size: (index * 7) % 3 + 1,
}));

const FloatingParticle = ({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) => (
  <span aria-hidden className="pointer-events-none absolute rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0%,rgba(200,180,255,0.4)_50%,transparent_70%)] blur-[1px] animate-[night-float_var(--particle-duration)_ease-in-out_infinite]"
    style={{ left, top, width: size, height: size, animationDelay: `${delay}s`, '--particle-duration': `${4 + delay}s` } as CSSProperties} />
);

const NightCareView = ({ initialData, collection }: NightCareViewProps) => {
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
    <div className="min-h-screen bg-[#0A0A0F]">
      <section className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(88,60,140,0.4)_0%,transparent_50%),radial-gradient(ellipse_60%_40%_at_80%_80%,rgba(60,40,100,0.3)_0%,transparent_50%),linear-gradient(180deg,#0D0D14_0%,#12121A_50%,#0A0A0F_100%)] sm:min-h-[320px] md:min-h-[360px]">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLES.map((particle, index) => <span key={index} className="absolute rounded-full bg-white animate-[night-twinkle_2s_ease-in-out_infinite]" style={{ left: particle.left, top: particle.top, animationDelay: particle.delay, width: particle.size, height: particle.size }} />)}
        </div>
        <FloatingParticle delay={0} size={6} left="10%" top="30%" />
        <FloatingParticle delay={1} size={4} left="85%" top="20%" />
        <FloatingParticle delay={2} size={8} left="70%" top="60%" />
        <FloatingParticle delay={0.5} size={5} left="25%" top="70%" />
        <FloatingParticle delay={1.5} size={7} left="90%" top="80%" />
        <span aria-hidden className="pointer-events-none absolute -top-10 -right-[30px] size-[150px] rounded-full bg-[radial-gradient(circle,rgba(200,190,255,0.15)_0%,rgba(150,140,200,0.05)_40%,transparent_70%)] blur-[40px] md:-top-[50px] md:right-20 md:size-[200px]" />
        <div className={cn('relative z-[2] max-w-[700px] px-6 text-center transition-opacity duration-1000', mounted ? 'opacity-100' : 'opacity-0')}>
          <div className="mb-4 flex items-center justify-center gap-3 text-[#9D8CCC]"><Moon size={16} /><span className="text-xs font-bold tracking-[3px]">ÖZEL KOLEKSİYON</span><Stars size={16} /></div>
          <h1 className="mb-3 bg-[linear-gradient(180deg,#FFF_0%,#C9B8FF_50%,#8B7ACC_100%)] bg-clip-text text-[32px] leading-none font-extrabold text-transparent drop-shadow-[0_0_40px_rgba(180,160,255,0.5)] sm:text-[42px] md:text-[52px]">Gece Bakımı</h1>
          <p className="mb-3 text-[15px] font-medium tracking-[1px] text-[#B8A8E8] sm:text-lg md:text-xl">Cildiniz uyurken yenilensin</p>
          <p className="mb-5 hidden text-sm leading-[1.6] text-white/60 sm:block">Gece serumları, uyku maskeleri ve yoğun bakım formülleriyle<br />sabaha ışıldayan bir cilde uyanın</p>
          <div className="hidden flex-wrap justify-center gap-6 sm:flex">
            {[[Sparkles, 'Hücre Yenilenmesi'], [Moon, 'Derin Nemlendirme'], [Stars, 'Anti-Aging']].map(([Icon, label]) => (
              <span key={label as string} className="flex items-center gap-2 text-sm font-semibold tracking-[0.5px] text-white/80"><Icon size={18} className="text-[#C9B8FF]" />{label as string}</span>
            ))}
          </div>
        </div>
      </section>
      <section className="relative z-[3] -mt-6 rounded-t-3xl bg-[#FAFAFA] px-3 py-6 sm:rounded-t-[32px] sm:px-6 sm:py-8">
        <nav aria-label="İçerik yolu" className="mb-4 flex items-center gap-1 text-sm text-text-medium-light">
          <Link href="/" className="transition-colors hover:text-[#6B5B95]"><span className="flex items-center gap-1"><Home size={14} />Ana Sayfa</span></Link>
          <ChevronRight size={14} /><span className="font-semibold">{collection.name}</span>
        </nav>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4"><span className="h-7 w-1 rounded bg-[linear-gradient(180deg,#6B5B95_0%,#9D8CCC_100%)]" /><h2 className="text-2xl font-bold">{initialData.totalCount} Ürün</h2></div>
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

export default NightCareView;
