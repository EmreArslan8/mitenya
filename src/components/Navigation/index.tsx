'use client';

import Button from '@/components/ui/Button';
import { ArrowLeft, CloseIcon, Heart, Menu, Search, ShoppingBag } from '@/components/icons';
import AccountMenu from './AccountMenu';
import { useAuth } from '@/contexts/AuthContext';
import { ShopContext } from '@/contexts/ShopContext';
import type { MegaMenuContent, MegaMenuGroup } from './MegaMenu';
import { useFavorites } from '@/contexts/FavoritesContext';
import { MegaNavCMSLink, ShopHeaderData, ShopHeaderLink } from '@/lib/api/types';
import { useIsMobileApp } from '@/lib/hooks/useIsMobileApp';
import { trackTikTokSearch, trackTikTokWithUser } from '@/lib/analytics/tiktokPixel';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { headerHeight } from '@/theme/breakpoints';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  FormEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import LoadingOverlay from '../LoadingOverlay';
import ShoppingCartButton from '../ShoppingCart/ShoppingCartButton';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import useScreen from '@/lib/hooks/useScreen';

const loadMegaMenu = () => import('./MegaMenu');
const loadMobileSearchOverlay = () => import('./MobileSearchOverlay');
const loadCategoriesDrawer = () => import('./CategoriesDrawer');
const loadCartDrawer = () => import('./CartDrawer');

const LazyMegaMenu = dynamic(loadMegaMenu, { ssr: false });
const LazyMobileSearchOverlay = dynamic(loadMobileSearchOverlay, { ssr: false });
const LazyCategoriesDrawer = dynamic(loadCategoriesDrawer, { ssr: false });
const LazyCartDrawer = dynamic(loadCartDrawer, { ssr: false });

const ANNOUNCEMENT_HEIGHT = 34;

interface NavigationProps {
  data: ShopHeaderData | undefined;
}


/**
 * TASLAK — header ana linkleri kodda sabit. CMS'teki link listesine
 * dokunmuyoruz; kalip onaylaninca Strapi'ye tasinacak.
 * Panel acmayan linkler dogrudan hedefe gider.
 */
const HEADER_LINKS: HeaderNavItem[] = [
  { id: 'new', label: 'Yeni Gelenler', href: '/search?sort=rct' },
  {
    id: 'skincare',
    label: 'Cilt Bakımı',
    href: '/search',
    panel: {
      variant: 'columns',
      groups: [
        {
          id: 'categories',
          title: 'Kategoriler',
          href: '/search',
          links: [
            { id: 'serum', label: 'Serumlar', href: '/search?category=yuz-bakim-serumlari' },
            { id: 'krem', label: 'Kremler', href: '/search?category=yuz-bakim-kremleri' },
            { id: 'goz', label: 'Göz Bakımı', href: '/search?category=goz-bakim' },
            { id: 'temizleyici', label: 'Temizleyiciler', href: '/search?category=yuz-temizleme-urunleri' },
            { id: 'gunes', label: 'Güneş Koruyucular', href: '/search?category=yuz-gunes-kremleri' },
          ],
        },
        {
          id: 'concern-short',
          title: 'İhtiyacına Göre',
          href: '/search',
          links: [
            { id: 'c-leke', label: 'Leke', href: '/search?concern=leke' },
            { id: 'c-akne', label: 'Akne', href: '/search?concern=akne' },
            { id: 'c-kuruluk', label: 'Kuruluk', href: '/search?concern=kuruluk' },
            { id: 'c-yaslanma', label: 'Yaşlanma', href: '/search?concern=yaslanma' },
            { id: 'c-hassasiyet', label: 'Hassasiyet', href: '/search?concern=hassasiyet' },
          ],
        },
        {
          id: 'highlights',
          title: 'Öne Çıkanlar',
          href: '/search',
          allLabel: 'Tüm ürünler',
          links: [
            { id: 'h-new', label: 'Yeni Gelenler', href: '/search?sort=rct' },
            { id: 'h-best', label: 'Çok Satanlar', href: '/search?sort=bst' },
            { id: 'h-day', label: 'Gündüz Rutini', href: '/collection/day-care' },
            { id: 'h-night', label: 'Gece Rutini', href: '/collection/night-care' },
            { id: 'h-brands', label: 'Markalar', href: '/search' },
          ],
        },
      ],
      feature: {
        image: '/static/images/mitenya-retinol-shot-banner-1600x600.webp',
        caption: 'Yeni: Retinol Shot',
        href: '/search?sort=rct',
      },
    },
  },
  {
    id: 'concern',
    label: 'İhtiyacına Göre',
    href: '/search',
    panel: {
      variant: 'tiles',
      tiles: [
        { id: 'leke', label: 'Leke', href: '/search?concern=leke', image: '/static/images/skin-concern-leke.webp' },
        { id: 'akne', label: 'Akne', href: '/search?concern=akne', image: '/static/images/skin-concern-akne.webp' },
        { id: 'kuruluk', label: 'Kuruluk', href: '/search?concern=kuruluk', image: '/static/images/skin-concern-kuruluk.webp' },
        { id: 'yaslanma', label: 'Yaşlanma', href: '/search?concern=yaslanma', image: '/static/images/skin-concern-yaslanma.webp' },
        { id: 'hassasiyet', label: 'Hassasiyet', href: '/search?concern=hassasiyet', image: '/static/images/skin-concern-hassasiyet.webp' },
      ],
    },
  },
  {
    id: 'routines',
    label: 'Rutinler',
    href: '/collection/day-care',
    panel: {
      variant: 'cards',
      cards: [
        {
          id: 'day',
          label: 'Gündüz',
          title: 'Koruyan rutin',
          description: 'Nemlendirme, antioksidan ve güneş koruması.',
          href: '/collection/day-care',
          image: '/static/images/mitenya-retinol-shot-banner-1600x600.webp',
        },
        {
          id: 'night',
          label: 'Gece',
          title: 'Onaran rutin',
          description: 'Retinol, peptit ve yoğun bakım.',
          href: '/collection/night-care',
          image: '/static/images/mitenya-numbuzin-no9-banner-1600x600.webp',
        },
      ],
    },
  },
  {
    id: 'brands',
    label: 'Markalar',
    href: '/search',
    panel: {
      variant: 'columns',
      groups: [
        {
          id: 'brand-list',
          title: 'Markalar',
          href: '/search',
          allLabel: 'Tüm markalar',
          links: [
            { id: 'boj', label: 'Beauty of Joseon', href: '/search?brand=beauty-of-joseon' },
            { id: 'celimax', label: 'Celimax', href: '/search?brand=celimax' },
            { id: 'numbuzin', label: 'Numbuzin', href: '/search?brand=numbuzin' },
            { id: 'mary-may', label: 'Mary & May', href: '/search?brand=mary-may' },
            { id: 'a313', label: 'A313', href: '/search?brand=a313' },
          ],
        },
      ],
      feature: {
        image: '/static/images/mitenya-numbuzin-no9-banner-1600x600.webp',
        caption: 'Numbuzin No.9',
        href: '/search?brand=numbuzin',
      },
    },
  },
  { id: 'blog', label: 'Blog', href: '/blogs' },
];

type HeaderNavItem = { id: string; label: string; href: string; panel?: MegaMenuContent };

const imageHost = process.env.NEXT_PUBLIC_IMAGE_HOST ?? '';

/** Strapi medya yolu goreli gelebiliyor; mutlak hale getiriliyor. */
const resolveMediaUrl = (url?: string | null) => {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${imageHost}${url}`;
};

/**
 * Panel tipi ayri bir alandan degil icerikten cikiyor:
 * gorsel + aciklama varsa kart, yalnizca gorsel varsa kadraj, yoksa metin sutunu.
 * Bir gruptaki linklerin HEPSINDE gorsel yoksa metne dusuluyor — eksik gorsel duzeni bozmasin.
 */
const toMegaMenuContent = (nav: MegaNavCMSLink): MegaMenuContent | undefined => {
  const groups = nav.groups ?? [];
  if (!groups.length) return undefined;

  const feature = nav.feature?.image?.data?.attributes?.url
    ? {
        image: resolveMediaUrl(nav.feature.image.data.attributes.url)!,
        caption: nav.feature.caption ?? '',
        href: nav.feature.url ?? '/search',
      }
    : undefined;

  const allLinks = groups.flatMap((group) => group.links ?? []);
  if (!allLinks.length) return undefined;

  const everyHasImage = allLinks.every((link) => Boolean(link.image?.data?.attributes?.url));
  const everyHasDescription = allLinks.every((link) => Boolean(link.description));

  if (everyHasImage && everyHasDescription) {
    return {
      variant: 'cards',
      cards: allLinks.map((link) => ({
        id: String(link.id),
        label: link.label,
        title: link.title || link.label,
        description: link.description ?? '',
        href: link.url,
        image: resolveMediaUrl(link.image?.data?.attributes?.url)!,
      })),
    };
  }

  if (everyHasImage) {
    return {
      variant: 'tiles',
      tiles: allLinks.map((link) => ({
        id: String(link.id),
        label: link.label,
        href: link.url,
        image: resolveMediaUrl(link.image?.data?.attributes?.url)!,
      })),
    };
  }

  const mappedGroups: MegaMenuGroup[] = groups.map((group) => ({
    id: String(group.id),
    title: group.title ?? undefined,
    href: group.url ?? undefined,
    allLabel: group.allLabel ?? undefined,
    links: (group.links ?? []).map((link) => ({
      id: String(link.id),
      label: link.label,
      href: link.url,
    })),
  }));

  return { variant: 'columns', groups: mappedGroups, feature };
};

const MEGA_MENU_OPEN_DELAY = 120;
const MEGA_MENU_CLOSE_DELAY = 250;

const MINIMAL_ROUTES = ['/payment'];

const BANNER_ROTATE_INTERVAL = 4000;

const Navigation = ({ data }: NavigationProps) => {
  const isMobileApp = useIsMobileApp();
  const isMobile = useScreen('smDown');
  const router = useRouter();
  const pathname = usePathname();
  const isSearchRoute = pathname === '/search';
  const isMinimal = MINIMAL_ROUTES.some((r) => pathname?.startsWith(r));
  const { isAuthenticated, openAuthenticator } = useAuth();
  const { numItems, newProductAdded } = useContext(ShopContext);
  const { favoriteIds } = useFavorites();
  const isCartEmpty = !numItems;
  const prevScrollPosition = useRef(0);
  const navbarRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(true);
  const navVarsSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cartDrawerActivated, setCartDrawerActivated] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categoriesDrawerActivated, setCategoriesDrawerActivated] = useState(false);
  const [mobileSearchInputOpen, setMobileSearchInputOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const megaMenuOpenTimer = useRef<number | null>(null);
  const megaMenuCloseTimer = useRef<number | null>(null);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerLinks = useMemo(() => data?.bannerLinks ?? [], [data?.bannerLinks]);
  const activeBannerLink = bannerLinks[bannerIndex % (bannerLinks.length || 1)];
  const secondaryLinks = useMemo(() => data?.links ?? [], [data?.links]);

  useEffect(() => {
    setMounted(true);
  }, []);


  const toggleCartModalOpen = () => {
    if (!isMobile) return;
    if (cartModalOpen) return setCartModalOpen(false);
    void loadCartDrawer();
    setCartDrawerActivated(true);
    setCategoriesOpen(false);
    setCartModalOpen(true);
  };

  const toggleCategoriesModalOpen = () => {
    if (categoriesOpen) return setCategoriesOpen(false);
    void loadCategoriesDrawer();
    setCategoriesDrawerActivated(true);
    setCartModalOpen(false);
    setCategoriesOpen(true);
  };

  const toggleMobileSearch = () => {
    if (!mobileSearchInputOpen) void loadMobileSearchOverlay();
    setMobileSearchInputOpen((prev) => !prev);
  };

  const handleAccountButtonClick = (destination: string = '/orders') => {
    if (isAuthenticated) return router.push(destination);
    openAuthenticator({ returnUrl: destination });
  };

  // CMS'te navLinks doluysa oradan, degilse taslak sabit listeden.
  const cmsNavLinks: HeaderNavItem[] = (data?.navLinks ?? []).map((nav) => ({
    id: String(nav.id),
    label: nav.label,
    href: nav.url,
    panel: toMegaMenuContent(nav),
  }));
  const headerLinks = cmsNavLinks.length ? cmsNavLinks : HEADER_LINKS;

  const activePanel = activeCategory === null ? undefined : headerLinks[activeCategory]?.panel;

  // Hover davranisi: acilis gecikmeli (jitter'i onler), kapanis toleransli
  // (link ile panel arasindaki capraz harekette menu kacmasin).
  const openMegaMenu = (index: number) => {
    void loadMegaMenu();
    if (megaMenuCloseTimer.current) window.clearTimeout(megaMenuCloseTimer.current);
    if (megaMenuOpenTimer.current) window.clearTimeout(megaMenuOpenTimer.current);
    megaMenuOpenTimer.current = window.setTimeout(
      () => setActiveCategory(index),
      MEGA_MENU_OPEN_DELAY,
    );
  };

  const closeMegaMenu = () => {
    if (megaMenuOpenTimer.current) window.clearTimeout(megaMenuOpenTimer.current);
    if (megaMenuCloseTimer.current) window.clearTimeout(megaMenuCloseTimer.current);
    megaMenuCloseTimer.current = window.setTimeout(
      () => setActiveCategory(null),
      MEGA_MENU_CLOSE_DELAY,
    );
  };

  const cancelMegaMenuClose = () => {
    if (megaMenuCloseTimer.current) window.clearTimeout(megaMenuCloseTimer.current);
  };

  const handleLinkClick = (link: ShopHeaderLink) => {
    // Slug girilmemis linkler ana sayfaya atmasin — tiklama sessizce yutulur.
    if (!link.slug) return;
    if (link.slug.startsWith('http')) {
      router.push(link.slug);
      return;
    }
    router.push(`/${link.slug}`);
  };

  const updateMobileNavVars = useCallback(() => {
    if (!navbarRef.current || typeof window === 'undefined') return;
    const root = document.documentElement;
    const navRect = navbarRef.current.getBoundingClientRect();
    const navBottom = Math.max(0, Math.round(navRect.bottom));
    const navHeight = Math.max(0, Math.round(navRect.height));
    root.style.setProperty('--mobile-nav-bottom', `${navBottom}px`);
    root.style.setProperty('--mobile-nav-spacer', `${navHeight}px`);
  }, []);

  const handleScroll = useCallback(() => {
    if (!navbarRef.current) return;
    const hidden = window.scrollY > 120 && window.scrollY > prevScrollPosition.current;
    const scrolled = window.scrollY > 0;
    const scrollingDown = window.scrollY > prevScrollPosition.current;

    if (isMobileRef.current) {
      const shouldKeepCompactHeaderVisible = isSearchRoute;
      // Mobilde duyuru seridi yok: kaydirirken kaydirilacak ek bant da yok.
      navbarRef.current.style.top = `${
        shouldKeepCompactHeaderVisible ? 0 : hidden ? -headerHeight.xs : 0
      }px`;
      if (shouldKeepCompactHeaderVisible && scrollingDown && mobileSearchInputOpen)
        setMobileSearchInputOpen(false);
    } else
      navbarRef.current.style.top =
        (hidden ? -52 - ANNOUNCEMENT_HEIGHT : scrolled ? -ANNOUNCEMENT_HEIGHT : 0) + 'px';

    navbarRef.current.style.boxShadow = scrolled ? '0 0 5px #00000010' : 'none';
    updateMobileNavVars();
    if (navVarsSyncTimeoutRef.current) clearTimeout(navVarsSyncTimeoutRef.current);
    navVarsSyncTimeoutRef.current = setTimeout(() => {
      updateMobileNavVars();
    }, 220);
    prevScrollPosition.current = window.scrollY;
  }, [isSearchRoute, mobileSearchInputOpen, updateMobileNavVars]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    isMobileRef.current = isMobile;
    if (!isMobile) setCartModalOpen(false);
  }, [isMobile]);

  useEffect(() => {
    setMobileSearchInputOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navbarRef.current) return;
    const node = navbarRef.current;
    updateMobileNavVars();
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === 'top') updateMobileNavVars();
    };
    window.addEventListener('resize', updateMobileNavVars);
    node.addEventListener('transitionend', onTransitionEnd);
    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updateMobileNavVars())
        : null;
    observer?.observe(node);
    return () => {
      window.removeEventListener('resize', updateMobileNavVars);
      node.removeEventListener('transitionend', onTransitionEnd);
      observer?.disconnect();
    };
  }, [updateMobileNavVars, pathname, mounted, mobileSearchInputOpen]);

  useEffect(() => {
    return () => {
      if (navVarsSyncTimeoutRef.current) clearTimeout(navVarsSyncTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeCategory === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveCategory(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeCategory]);

  useEffect(
    () => () => {
      if (megaMenuOpenTimer.current) window.clearTimeout(megaMenuOpenTimer.current);
      if (megaMenuCloseTimer.current) window.clearTimeout(megaMenuCloseTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!newProductAdded) return;
    void loadCartDrawer();
    setCartDrawerActivated(true);
    setCartModalOpen(true);
  }, [newProductAdded]);

  useEffect(() => {
    setDesktopSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!desktopSearchOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDesktopSearchOpen(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!navbarRef.current?.contains(event.target as Node)) setDesktopSearchOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [desktopSearchOpen]);

  useEffect(() => {
    if (bannerLinks.length < 2 || typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerLinks.length);
    }, BANNER_ROTATE_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [bannerLinks]);

  return (
    <>
      <div className={isSearchRoute ? 'h-[var(--mobile-nav-spacer,94px)] sm:h-auto' : 'h-14 sm:h-auto'}>
        <div
          className="fixed left-0 right-0 top-0 z-[1297] h-auto bg-bg px-2 transition-[top,box-shadow] duration-200 sm:px-6 md:relative"
          ref={navbarRef}
        >
          {!isMinimal && (
          <div className={isMobileApp ? 'relative left-1/2 hidden h-[34px] w-screen -translate-x-1/2 overflow-hidden bg-bg sm:flex sm:justify-center' : 'relative left-1/2 hidden h-[34px] w-screen -translate-x-1/2 overflow-hidden bg-error sm:flex sm:justify-center'}>
            <div className="relative flex w-screen items-center justify-center self-center overflow-hidden">
              {activeBannerLink ? (
                <button
                  type="button"
                  key={`${activeBannerLink.label}-${bannerIndex}`}
                  className={isMobileApp ? 'min-h-[34px] appearance-none border-0 bg-transparent px-6 text-[13px] tracking-[0.01em] text-text motion-reduce:animate-none' : 'min-h-[34px] appearance-none border-0 bg-transparent px-6 text-[13px] tracking-[0.01em] text-error-contrast-text motion-reduce:animate-none'}
                  onClick={() => handleLinkClick(activeBannerLink)}
                >
                  {activeBannerLink.label}
                </button>
              ) : null}
            </div>
          </div>
          )}
          <div className="relative mx-auto flex w-full max-w-[1340px] flex-col gap-1 py-2" onMouseLeave={closeMegaMenu}>
            {!isMinimal && !!secondaryLinks.length && (
              <div className="hidden w-full items-center justify-end sm:flex">
                {secondaryLinks.map((link) => (
                  <button
                    type="button"
                    key={`${link.label}-${link.slug}`}
                    className="appearance-none border-0 bg-transparent px-2 py-0.5 text-[13px] font-normal whitespace-nowrap text-text-medium-light hover:text-error disabled:cursor-default"
                    disabled={!link.slug}
                    onMouseEnter={() => setActiveCategory(null)}
                    onClick={() => handleLinkClick(link)}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-4">
              {isMinimal ? (
                <>
                  <button type="button" className="flex appearance-none items-center gap-2 border-0 bg-transparent p-0" onClick={() => router.push('/')}>
                    <Image
                      src="/static/images/logo.svg"
                      alt="mitenya"
                      width={150}
                      height={48}
                      className="h-12 w-[150px] object-contain"
                      unoptimized
                    />
                  </button>
                  <button type="button" className="flex appearance-none items-center gap-2 border-0 bg-transparent p-2" onClick={() => router.push('/cart')}>
                    <ArrowLeft size={18} />
                    <span className="text-sm">Sepete Dön</span>
                  </button>
                </>
              ) : (
                <>
              <div className="flex w-full items-center justify-between sm:hidden">
                  {isMobileApp && pathname?.includes('/product/') ? (
                    <button type="button" className="inline-flex size-10 appearance-none items-center justify-center border-0 bg-transparent p-0" onClick={() => router.back()} aria-label="Geri">
                      <ArrowLeft size={24} />
                    </button>
                  ) : (
                    <button type="button" className="inline-flex size-10 appearance-none items-center justify-center border-0 bg-transparent p-0" onClick={toggleCategoriesModalOpen} aria-label="Kategoriler">
                      <Menu size={24} strokeWidth={1.5} />
                    </button>
                  )}
                  <button type="button" className="flex min-h-11 flex-1 appearance-none items-center justify-center border-0 bg-transparent p-0" onClick={() => router.push('/')}>
                    <Image
                      src="/static/images/logo.svg"
                      alt="mitenya"
                      width={110}
                      height={30}
                      className="h-[30px] w-[110px] object-contain"
                      unoptimized
                    />
                  </button>
                  <div className="flex items-center gap-2">
                    <button type="button" className="inline-flex size-10 appearance-none items-center justify-center border-0 bg-transparent p-0"
                      onClick={toggleMobileSearch}
                      aria-label={mobileSearchInputOpen ? 'Aramayı kapat' : 'Arama'}
                      aria-expanded={mobileSearchInputOpen}
                    >
                      {mobileSearchInputOpen ? (
                        <CloseIcon size={24} />
                      ) : (
                        <Search size={24} strokeWidth={1.5} />
                      )}
                    </button>
                    <button type="button" className="inline-flex size-10 appearance-none items-center justify-center border-0 bg-transparent p-0"
                      onClick={toggleCartModalOpen}
                      aria-label={numItems ? `Sepet (${numItems} ürün)` : 'Sepet'}
                    >
                      <Badge dot invisible={!numItems} badgeClassName="size-[7px] rounded-full">
                        <ShoppingBag size={24} strokeWidth={1.5} />
                      </Badge>
                    </button>
                  </div>
              </div>
              <div className="hidden w-full items-center gap-4 sm:flex">
                  <div className="flex min-w-0 flex-1 items-center [&>*]:shrink-0">
                  <button type="button" className="mr-2 hidden size-12 appearance-none items-center justify-center border-0 bg-transparent p-0 sm:flex md:hidden"
                    onClick={toggleCategoriesModalOpen}
                    aria-label="Kategoriler"
                  >
                    <Menu size={24} />
                  </button>
                  {isMobileApp && pathname?.includes('/product/') ? (
                    <button type="button" className="flex h-10 appearance-none items-center rounded-lg border-0 bg-transparent p-2 text-text" onClick={() => router.back()}>
                      <ArrowLeft size={24} />
                    </button>
                  ) : (
                    <button type="button" className="flex shrink-0 appearance-none items-center border-0 bg-transparent p-0" onClick={() => router.push('/')}>
                      <Image
                        src="/static/images/logo.svg"
                        alt="mitenya"
                        width={150}
                        height={48}
                        className="h-12 w-[150px] object-contain"
                        unoptimized
                      />
                    </button>
                  )}
                  </div>
                  <nav className="hidden min-w-0 shrink items-center justify-center overflow-hidden text-bg-contrast-text md:flex">
                    {headerLinks.map((link, index) => (
                      <button type="button"
                        key={link.id}
                        className="relative appearance-none border-0 bg-transparent px-2 py-2.5 text-[15px] font-bold uppercase tracking-[0.01em] whitespace-nowrap text-text-medium transition-colors after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:origin-center after:scale-x-0 after:rounded after:bg-error after:transition-transform hover:text-error hover:after:scale-x-100 focus-visible:text-error focus-visible:after:scale-x-100 lg:px-4"
                        aria-expanded={link.panel ? activeCategory === index : undefined}
                        onMouseEnter={() => (link.panel ? openMegaMenu(index) : closeMegaMenu())}
                        onClick={() => {
                          setActiveCategory(null);
                          router.push(link.href);
                        }}
                      >
                        {link.label}
                      </button>
                    ))}
                  </nav>
                  <div className="flex min-w-0 flex-1 items-center justify-end">
                    <div className="flex shrink-0 items-center lg:gap-1">
                      <button type="button" className="flex size-12 min-w-12 appearance-none items-center justify-center border-0 bg-transparent p-0 text-bg-contrast-text [&_svg]:size-6"
                        onClick={() => setDesktopSearchOpen((prev) => !prev)}
                        aria-label="Ara"
                        aria-expanded={desktopSearchOpen}
                      >
                        {desktopSearchOpen ? <CloseIcon /> : <Search />}
                      </button>
                      {mounted && (
                        <>
                          <AccountMenu triggerClassName="flex min-w-0 items-center gap-2 px-2 text-bg-contrast-text [&_svg]:size-[23px]" />
                          <button type="button" className="flex size-12 min-w-12 appearance-none items-center justify-center border-0 bg-transparent p-0 text-bg-contrast-text [&_svg]:size-6"
                            onClick={() => handleAccountButtonClick('/settings?section=favorites')}
                            aria-label="Favorilerim"
                          >
                            <Badge
                              content={favoriteIds.size}
                              badgeClassName="h-[19px] min-w-[19px] px-1 text-[11px]"
                            >
                              <Heart />
                            </Badge>
                          </button>
                          <ShoppingCartButton compact />
                        </>
                      )}
                    </div>
                  </div>
              </div>
                </>
              )}
            </div>

            {!isMinimal && activePanel && (
              <LazyMegaMenu
                {...activePanel}
                onSelect={(href) => {
                  setActiveCategory(null);
                  router.push(href);
                }}
                onMouseEnter={cancelMegaMenuClose}
                onMouseLeave={closeMegaMenu}
              />
            )}
          </div>
          {!isMinimal && desktopSearchOpen && (
            <div className="absolute left-0 right-0 top-full z-[1298] hidden animate-[mega-menu-in_.18s_ease] border-t border-gray-100 bg-bg px-6 py-5 shadow-[0_18px_30px_rgba(15,20,32,0.10)] motion-reduce:animate-none sm:flex">
              <div className="mx-auto w-full max-w-[1340px]">
                <SearchBar wide autoFocus onBlur={() => undefined} />
              </div>
            </div>
          )}
        </div>
      </div>
      {!isMinimal && mobileSearchInputOpen && (
        <LazyMobileSearchOverlay
          open={mobileSearchInputOpen}
          onClose={() => setMobileSearchInputOpen(false)}
        />
      )}
      {!isMinimal && (
        <>
          {cartDrawerActivated && (
            <LazyCartDrawer
              open={cartModalOpen}
              empty={isCartEmpty}
              onClose={() => setCartModalOpen(false)}
            />
          )}
          {categoriesDrawerActivated && (
            <LazyCategoriesDrawer
              open={categoriesOpen}
              onClose={() => setCategoriesOpen(false)}
              categories={data?.categories}
              isAuthenticated={isAuthenticated ?? undefined}
              onAccount={() => handleAccountButtonClick('/settings')}
              onOrders={() => isAuthenticated ? handleAccountButtonClick('/orders') : router.push('/siparis-takip')}
              onFavorites={() => handleAccountButtonClick('/settings?section=favorites')}
              onNavigate={(slug) => router.push(`/${slug}`)}
            />
          )}
        </>
      )}
    </>
  );
};

interface SearchBarProps {
  onFocus?: () => void;
  onBlur?: () => void;
  autoFocus?: boolean;
  wide?: boolean;
}

const SearchBar = ({ onFocus, onBlur, autoFocus, wide }: SearchBarProps) => {
  const router = useRouter();
  const { customerData } = useAuth();
  const searchParams = useSearchParams()!;
  const pathname = usePathname();
  const [query, setQuery] = useState((!searchParams.get('nt') && searchParams.get('query')) || '');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { searchHistory, addSearchQuery, removeSearchQuery, clearAllHistory } =
    useContext(ShopContext);
  const searchHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery('');
  }, [pathname]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    addSearchQuery(query);
    trackTikTokWithUser({
      userData: {
        email: customerData?.email,
        phone: customerData?.phone,
      },
      track: () => trackTikTokSearch({ search_string: query }),
    });
    setShowHistory(false);
    router.push(searchUrlFromOptions({ query }, query === searchParams.get('query')));
  };

  useEffect(() => {
    setLoading(false);
  }, [searchParams, pathname]);

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    setShowHistory(false);
    trackTikTokWithUser({
      userData: {
        email: customerData?.email,
        phone: customerData?.phone,
      },
      track: () => trackTikTokSearch({ search_string: historyItem }),
    });
    router.push(searchUrlFromOptions({ query: historyItem }, true));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchHistoryRef.current && !searchHistoryRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchHistoryRef]);

  return (
    <form
      onSubmit={handleSubmit}
      className={wide ? 'relative flex w-full max-w-none justify-start gap-2.5' : 'relative flex w-full max-w-full justify-end gap-2.5 sm:max-w-[260px]'}
      autoComplete="off"
    >
      <Input
        size="small"
        autoComplete="off"
        autoFocus={autoFocus}
        value={query}
        onFocus={() => onFocus?.()}
        onBlur={() => onBlur?.()}
        onClick={() => setShowHistory(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowHistory(true);
        }}
        placeholder="Ara"
        aria-label="Ürün ara"
        /* Eski styles.searchBarInput: köşe 0, minHeight {xs:36, sm:38} */
        className="min-h-9 rounded-none sm:min-h-[38px]"
        endSlot={
          <button type="submit" aria-label="Ara" className="inline-flex size-8 appearance-none items-center justify-center rounded-full border-0 bg-transparent p-0 text-text sm:size-[34px]">
            <Search size={20} strokeWidth={2.4} />
          </button>
        }
      />
      <LoadingOverlay loading={loading} />
      {showHistory && searchHistory.length > 0 && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-[1] w-full rounded-[10px] border border-gray-100 bg-white/[94%] px-3.5 py-2.5 shadow-[0_20px_34px_rgba(9,16,29,0.14)] backdrop-blur-[10px]" ref={searchHistoryRef} id="search-history-container">
          <div className="flex items-center justify-between">
            <strong>Arama Geçmişi</strong>
            <Button size="small" color="neutral" variant="text" className="-mx-4" onClick={clearAllHistory}>
              Temizle
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {searchHistory
              .slice(-10)
              .reverse()
              .map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between"
                >
                  <button type="button"
                    onClick={() => handleHistoryClick(item)}
                    className="w-full appearance-none border-0 bg-transparent p-0 text-left"
                  >
                    {item}
                  </button>
                  <button type="button" aria-label={`${item} aramasını kaldır`} onClick={() => removeSearchQuery(item)} className="inline-flex size-8 appearance-none items-center justify-center border-0 bg-transparent p-0">
                    <CloseIcon />
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </form>
  );
};

export default Navigation;
