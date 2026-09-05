'use client';

import Button from '@/components/common/Button';
import { ArrowLeft, CloseIcon, Heart, History, Menu, Search, User } from '@/components/icons';
import CartPageView from '@/features/cart/CartPageView';
import AccountMenu from './AccountMenu';
import { useAuth } from '@/contexts/AuthContext';
import { ShopContext } from '@/contexts/ShopContext';
import MobileSearchOverlay from './MobileSearchOverlay';
import MegaMenu, { MegaMenuContent, MegaMenuGroup } from './MegaMenu';
import { useFavorites } from '@/contexts/FavoritesContext';
import { MegaNavCMSLink, ShopHeaderData, ShopHeaderLink } from '@/lib/api/types';
import { useIsMobileApp } from '@/lib/hooks/useIsMobileApp';
import useScreen from '@/lib/hooks/useScreen';
import { trackTikTokSearch, trackTikTokWithUser } from '@/lib/analytics/tiktokPixel';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { signOut } from '@/lib/utils/signOut';
import { headerHeight } from '@/theme/theme';
import {
  Badge,
  Box,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Image from 'next/image';
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
import ModalCard from '../common/ModalCard';
import CategoriesDrawer from './CategoriesDrawer';
import useStyles, { ANNOUNCEMENT_HEIGHT } from './styles';
import {
  Headset,
  ShoppingBag,
  LogOut,
  LogIn,
  HelpCircle,
  Settings,
  PackageSearch,
} from 'lucide-react';


const getSupportUrl = 'https://api.whatsapp.com/send?phone=905070617930';

const accountModalRoutes = [
  { label: 'orders', labelTr: 'Siparişler', url: '/orders', icon: History },
  { label: 'settings', labelTr: 'Ayarlar', url: '/settings', icon: Settings },
];

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
  const router = useRouter();
  const pathname = usePathname();
  const { smDown } = useScreen();
  const isSearchRoute = pathname === '/search';
  const isMobileSearchRoute = smDown && isSearchRoute;
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
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileSearchInputOpen, setMobileSearchInputOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const megaMenuOpenTimer = useRef<number | null>(null);
  const megaMenuCloseTimer = useRef<number | null>(null);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);
  const styles = useStyles();
  const bannerLinks = useMemo(() => data?.bannerLinks ?? [], [data?.bannerLinks]);
  const activeBannerLink = bannerLinks[bannerIndex % (bannerLinks.length || 1)];
  const secondaryLinks = useMemo(() => data?.links ?? [], [data?.links]);

  useEffect(() => {
    setMounted(true);
  }, []);


  const toggleCartModalOpen = () => {
    if (!smDown) return;
    if (cartModalOpen) return setCartModalOpen(false);
    setCategoriesOpen(false);
    setAccountModalOpen(false);
    setCartModalOpen(true);
  };

  const toggleCategoriesModalOpen = () => {
    if (categoriesOpen) return setCategoriesOpen(false);
    setAccountModalOpen(false);
    setCartModalOpen(false);
    setCategoriesOpen(true);
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
    isMobileRef.current = smDown;
    if (!smDown) setCartModalOpen(false);
  }, [smDown, pathname, cartModalOpen]);

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
  }, [updateMobileNavVars, smDown, pathname, mounted, mobileSearchInputOpen]);

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
    if (newProductAdded) setCartModalOpen(true);
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
      <Stack
        sx={{
          ...styles.container,
          ...(isMobileSearchRoute ? { height: { xs: 'var(--mobile-nav-spacer, 94px)' } } : {}),
        }}
      >
        <Stack sx={styles.innerContainer} ref={navbarRef}>
          {!isMinimal && (
          <Stack sx={styles.banner}>
            <Stack sx={styles.bannerInnerContainer}>
              {activeBannerLink ? (
                <MenuItem
                  key={`${activeBannerLink.label}-${bannerIndex}`}
                  sx={styles.bannerLink}
                  onClick={() => handleLinkClick(activeBannerLink)}
                >
                  {activeBannerLink.label}
                </MenuItem>
              ) : null}
            </Stack>
          </Stack>
          )}
          <Stack sx={styles.content} onMouseLeave={closeMegaMenu}>
            {!isMinimal && !!secondaryLinks.length && (
              <Stack sx={styles.utilityLinks}>
                {secondaryLinks.map((link) => (
                  <MenuItem
                    key={`${link.label}-${link.slug}`}
                    sx={{ ...styles.utilityLink, ...(link.slug ? {} : styles.utilityLinkInert) }}
                    onMouseEnter={() => setActiveCategory(null)}
                    onClick={() => handleLinkClick(link)}
                  >
                    {link.label}
                  </MenuItem>
                ))}
              </Stack>
            )}
            <Stack sx={styles.primaryBar}>
              {isMinimal ? (
                <>
                  <Stack direction="row" alignItems="center" gap={1} sx={{ cursor: 'pointer' }} onClick={() => router.push('/')}>
                    <Image
                      src={styles.logo.src}
                      alt="mitenya"
                      width={styles.logo.width}
                      height={styles.logo.height}
                      style={styles.logo}
                    />
                  </Stack>
                  <MenuItem onClick={() => router.push('/cart')} sx={{ gap: 1 }}>
                    <ArrowLeft size={18} />
                    <Typography fontSize={14}>Sepete Dön</Typography>
                  </MenuItem>
                </>
              ) : (
                <>
              {/* Mobile primary bar — xs'te flex, sm+'da CSS ile gizli */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ display: { xs: 'flex', sm: 'none' }, width: '100%' }}
              >
                  {isMobileApp && pathname?.includes('/product/') ? (
                    <IconButton onClick={() => router.back()} aria-label="Geri">
                      <ArrowLeft size={24} />
                    </IconButton>
                  ) : (
                    <IconButton onClick={toggleCategoriesModalOpen} aria-label="Kategoriler">
                      <Menu size={24} strokeWidth={1.5} />
                    </IconButton>
                  )}
                  <Stack sx={styles.logoMobileTapArea} onClick={() => router.push('/')}>
                    <Image
                      src={styles.logoMobile.src}
                      alt="mitenya"
                      width={styles.logoMobile.width}
                      height={styles.logoMobile.height}
                      style={styles.logoMobile}
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <IconButton
                      onClick={() => setMobileSearchInputOpen((prev) => !prev)}
                      aria-label={mobileSearchInputOpen ? 'Aramayı kapat' : 'Arama'}
                      aria-expanded={mobileSearchInputOpen}
                    >
                      {mobileSearchInputOpen ? (
                        <CloseIcon size={24} />
                      ) : (
                        <Search size={24} strokeWidth={1.5} />
                      )}
                    </IconButton>
                    <IconButton
                      onClick={toggleCartModalOpen}
                      aria-label={numItems ? `Sepet (${numItems} ürün)` : 'Sepet'}
                    >
                      <Badge
                        variant="dot"
                        color="error"
                        invisible={!numItems}
                        sx={{ '& .MuiBadge-badge': { minWidth: 7, height: 7, borderRadius: '50%' } }}
                      >
                        <ShoppingBag size={24} strokeWidth={1.5} />
                      </Badge>
                    </IconButton>
                  </Stack>
              </Stack>
              {/* Desktop primary bar — sm+'da flex, xs'te CSS ile gizli */}
              <Stack
                direction="row"
                alignItems="center"
                gap={2}
                sx={{ display: { xs: 'none', sm: 'flex' }, width: '100%' }}
              >
                  <Stack sx={styles.barSide}>
                  <IconButton
                    onClick={toggleCategoriesModalOpen}
                    aria-label="Kategoriler"
                    sx={styles.categoriesToggle}
                  >
                    <Menu size={24} />
                  </IconButton>
                  {isMobileApp && pathname?.includes('/product/') ? (
                    <MenuItem onClick={() => router.back()} sx={styles.backButton}>
                      <ArrowLeft size={24} />
                    </MenuItem>
                  ) : (
                    <Stack sx={styles.inlineLogo} onClick={() => router.push('/')}>
                      <Image
                        src={styles.logo.src}
                        alt="mitenya"
                        width={styles.logo.width}
                        height={styles.logo.height}
                        style={styles.logo}
                      />
                    </Stack>
                  )}
                  </Stack>
                  <Stack sx={styles.categoryBar}>
                    {headerLinks.map((link, index) => (
                      <MenuItem
                        key={link.id}
                        sx={styles.shopHeaderLink}
                        aria-expanded={link.panel ? activeCategory === index : undefined}
                        onMouseEnter={() => (link.panel ? openMegaMenu(index) : closeMegaMenu())}
                        onClick={() => {
                          setActiveCategory(null);
                          router.push(link.href);
                        }}
                      >
                        {link.label}
                      </MenuItem>
                    ))}
                  </Stack>
                  <Stack sx={{ ...styles.barSide, justifyContent: 'flex-end' }}>
                    <Stack sx={styles.actions}>
                      <MenuItem
                        sx={{ ...styles.action, ...styles.actionIcon }}
                        onClick={() => setDesktopSearchOpen((prev) => !prev)}
                        aria-label="Ara"
                        aria-expanded={desktopSearchOpen}
                      >
                        {desktopSearchOpen ? <CloseIcon /> : <Search />}
                      </MenuItem>
                      {mounted && (
                        <>
                          <AccountMenu triggerSx={{ ...styles.action, ...styles.actionIcon }} />
                          <MenuItem
                            sx={{ ...styles.action, ...styles.actionIcon }}
                            onClick={() => handleAccountButtonClick('/settings?section=favorites')}
                            aria-label="Favorilerim"
                          >
                            <Badge
                              badgeContent={favoriteIds.size}
                              color="error"
                              sx={{ '& .MuiBadge-badge': { minWidth: 19, height: 19, fontSize: 11, px: 0.5 } }}
                            >
                              <Heart />
                            </Badge>
                          </MenuItem>
                          <ShoppingCartButton compact />
                        </>
                      )}
                    </Stack>
                  </Stack>
              </Stack>
                </>
              )}
            </Stack>

            {!isMinimal && activePanel && (
              <MegaMenu
                {...activePanel}
                onSelect={(href) => {
                  setActiveCategory(null);
                  router.push(href);
                }}
                onMouseEnter={cancelMegaMenuClose}
                onMouseLeave={closeMegaMenu}
              />
            )}
          </Stack>
          {!isMinimal && desktopSearchOpen && (
            <Stack sx={styles.searchPanel}>
              <Stack sx={styles.searchPanelInner}>
                <SearchBar wide autoFocus onBlur={() => undefined} />
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
      {/* {!isMinimal && smDown && (
        <Stack sx={styles.bottomNavigation}>
          <BottomNavigation
            showLabels
            value={
              cartModalOpen || pathname === '/checkout'
                ? '/cart'
                : accountModalOpen || accountModalRoutes.some((e) => pathname?.startsWith(e.url))
                  ? '/account'
                  : pathname
            }
            sx={{
              '& .MuiBottomNavigationAction-root': { px: 0, minWidth: 0 },
              // Mobilde ince çizgi: header ile aynı ağırlık.
              '& svg': { strokeWidth: 1.5 },
            }}
          >
            <BottomNavigationAction
              value="/"
              label="AnaSayfa"
              icon={<Home />}
              onClick={() => {
                if (!((cartModalOpen || accountModalOpen) && pathname === '/')) router.push('/');
                setAccountModalOpen(false);
                setCartModalOpen(false);
                setCategoriesOpen(false);
              }}
            />
            <BottomNavigationAction
              value="favorites"
              label={'Favoriler'}
              icon={<Heart size={24} />}
            />
            <BottomNavigationAction
              value="/cart"
              label="Sepet"
              icon={
                <Badge
                  badgeContent={numItems}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { minWidth: 18, height: 18, fontSize: 11, mt: '2px', px: 0.5 } }}
                >
                  <ShoppingBag />
                </Badge>
              }
              onClick={toggleCartModalOpen}
            />
            <BottomNavigationAction
              value="/account"
              label="Hesap"
              icon={<User />}
              onClick={toggleAccountModalOpen}
            />
            <BottomNavigationAction
              value="chat"
              label="İletişim"
              icon={
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { minWidth: 18, height: 18, mt: '2px', px: 0.5 } }}
                >
                  <Headset />
                </Badge>
              }
              onClick={() => {
                // Crisp.chat.show();
                // Crisp.chat.open();
              }}
            />
          </BottomNavigation>
        </Stack>
      )} */}
      {!isMinimal && (
        <MobileSearchOverlay
          open={mobileSearchInputOpen}
          onClose={() => setMobileSearchInputOpen(false)}
        />
      )}
      {!isMinimal && (
        <>
          <ModalCard
            keepMounted={smDown}
            open={cartModalOpen}
            onClose={() => setCartModalOpen(false)}
            showCloseIcon
            title="Sepet"
            fullWidth={isCartEmpty}
            CardProps={{
              sx: {
                height: isCartEmpty ? 'auto' : '100%',
                // Boş sepet artık illüstrasyonlu bir blok; eski 300px'lik kutuya sığmıyor.
                maxHeight: isCartEmpty ? { xs: '70vh', sm: 520 } : undefined,
                pb: isCartEmpty ? 2 : 12,
              },
            }}
            sx={{ zIndex: 1297 }}
          >
            <CartPageView
              hideTitle
              visible={cartModalOpen}
              onContinue={() => setCartModalOpen(false)}
              onItemClick={() => setCartModalOpen(false)}
            />
          </ModalCard>
          <ModalCard
            title="Hesap"
            keepMounted={smDown}
            showCloseIcon
            open={accountModalOpen}
            onClose={() => setAccountModalOpen(false)}
            sx={{ zIndex: 1299 }}
          >
            <Grid container spacing={1} pb={9}>
              <Grid item xs={12}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  {isAuthenticated ? (
                    <MenuItem onClick={signOut} sx={styles.logoutButton}>
                      <LogOut /> Çıkış
                    </MenuItem>
                  ) : (
                    <MenuItem onClick={() => openAuthenticator()} sx={styles.loginButton}>
                      <LogIn /> Giriş Yap
                    </MenuItem>
                  )}
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid item xs={6}>
                <MenuItem
                  onClick={() => {
                    router.push('/siparis-takip');
                    setAccountModalOpen(false);
                  }}
                  sx={styles.accountMenuItem}
                >
                  <PackageSearch size={18} />
                  Sipariş Takip
                </MenuItem>
              </Grid>
              {accountModalRoutes.map((e) => (
                <Grid item xs={6} key={e.label}>
                  <MenuItem
                    onClick={() => {
                      handleAccountButtonClick(e.url);
                      setAccountModalOpen(false);
                    }}
                    sx={styles.accountMenuItem}
                  >
                    <e.icon size={18} />
                    {e.labelTr}
                  </MenuItem>
                </Grid>
              ))}
              {getSupportUrl && (
                <Grid item xs={6}>
                  <MenuItem
                    component="a"
                    href={getSupportUrl!}
                    target="_blank"
                    sx={styles.accountMenuItem}
                  >
                    <Headset /> Yardım
                  </MenuItem>
                </Grid>
              )}
              <Grid item xs={6}>
                <MenuItem
                  component="a"
                  href={`https://help.mitenya.com/`}
                  target="_blank"
                  sx={styles.accountMenuItem}
                >
                  <HelpCircle /> SSS
                </MenuItem>
              </Grid>
            </Grid>
          </ModalCard>
          <CategoriesDrawer
            open={categoriesOpen}
            onClose={() => setCategoriesOpen(false)}
            categories={data?.categories}
            isAuthenticated={isAuthenticated ?? undefined}
            onAccount={() => handleAccountButtonClick('/settings')}
            onOrders={() => isAuthenticated ? handleAccountButtonClick('/orders') : router.push('/siparis-takip')}
            onFavorites={() => handleAccountButtonClick('/settings?section=favorites')}
            onNavigate={(slug) => router.push(`/${slug}`)}
          />
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
  const styles = useStyles();
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
    <Stack
      component="form"
      onSubmit={handleSubmit}
      sx={wide ? { ...styles.searchBar, ...styles.searchBarWide } : styles.searchBar}
      autoComplete="off"
    >
      <TextField
        fullWidth
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
        sx={[styles.searchBarInput, ...(wide ? [styles.searchBarInputWide] : [])]}
        InputProps={{
          endAdornment: (
            <IconButton type="submit" size="small" aria-label="Ara">
              <Search size={20} strokeWidth={2.4} />
            </IconButton>
          ),
        }}
      />
      <LoadingOverlay loading={loading} />
      {showHistory && searchHistory.length > 0 && (
        <Box sx={styles.historyContainer} ref={searchHistoryRef} id="search-history-container">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" fontWeight="bold">
              Arama Geçmişi
            </Typography>
            <Button size="small" color="neutral" sx={{ mx: -2 }} onClick={clearAllHistory}>
              Temizle
            </Button>
          </Stack>
          <Stack gap={1}>
            {searchHistory
              .slice(-10)
              .reverse()
              .map((item) => (
                <Stack
                  key={item}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={styles.historyItem}
                >
                  <Typography
                    onClick={() => handleHistoryClick(item)}
                    sx={{ cursor: 'pointer', width: '100%' }}
                  >
                    {item}
                  </Typography>
                  <IconButton onClick={() => removeSearchQuery(item)} size="small">
                    <CloseIcon />
                  </IconButton>
                </Stack>
              ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
};

export default Navigation;
