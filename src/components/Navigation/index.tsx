'use client';

import CartPageView from '@/app/cart/view'
import Button from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopHeaderData, ShopHeaderLink } from '@/lib/api/types';
import { useIsMobileApp } from '@/lib/hooks/useIsMobileApp';
import useScreen from '@/lib/hooks/useScreen';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { signOut } from '@/lib/utils/signOut';
import { headerHeight } from '@/theme/theme';
import {
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Collapse,
  Divider,
  Grid,
  IconButton,
  keyframes,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  CSSProperties,
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
import { CrossFade } from '../common/CrossFade';
import ModalCard from '../common/ModalCard';
import CategoriesDrawer from './CategoriesDrawer';
import useStyles, { ANNOUNCEMENT_HEIGHT } from './styles';
import { Headset, ArrowLeft, CircleUser, ShoppingBag, LogOut, LogIn, HelpCircle, Search, X, Home, History, Settings, Menu, Heart, User, ChevronRight } from 'lucide-react';

const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
`;

const getSupportUrl = 'https://api.whatsapp.com/send?phone=905070617930';

const accountModalRoutes = [
  { label: 'orders', labelTr: 'Siparişler', url: '/orders', icon: History },
  { label: 'settings', labelTr: 'Ayarlar', url: '/settings', icon: Settings },
];

interface NavigationProps {
  data: ShopHeaderData | undefined;
}

const MINIMAL_ROUTES = ['/payment'];

const Navigation = ({ data }: NavigationProps) => {
  const isMobileApp = useIsMobileApp();
  const router = useRouter();
  const pathname = usePathname();
  const { smDown, smUp } = useScreen();
  const isSearchRoute = pathname === '/search';
  const isMobileSearchRoute = smDown && isSearchRoute;
  const isMinimal = MINIMAL_ROUTES.some((r) => pathname?.startsWith(r));
  const { isAuthenticated, openAuthenticator } = useAuth();
  const { numItems, newProductAdded } = useContext(ShopContext);
  const isCartEmpty = !numItems;
  const prevScrollPosition = useRef(0);
  const navbarRef = useRef<HTMLDivElement>(null);
  const marqueeMeasureRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(true);
  const navVarsSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [logoCollapsed, setLogoCollapsed] = useState(false);
  const [mobileSearchInputOpen, setMobileSearchInputOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [marqueeRepeatCount, setMarqueeRepeatCount] = useState(2);
  const [marqueeCycleWidth, setMarqueeCycleWidth] = useState(0);
  const styles = useStyles();
  const bannerLinks = useMemo(() => data?.bannerLinks ?? [], [data?.bannerLinks]);
  const marqueeLinks = useMemo(() => {
    if (!bannerLinks.length) return [];
    return Array.from({ length: marqueeRepeatCount }, () => bannerLinks).flat();
  }, [bannerLinks, marqueeRepeatCount]);
  const marqueeDuration = useMemo(() => {
    if (!marqueeCycleWidth) return 28;
    return Math.max(16, Math.min(60, marqueeCycleWidth / 70));
  }, [marqueeCycleWidth]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const collapseIn = mounted ? (!logoCollapsed || smUp) : true;

  const toggleCartModalOpen = () => {
    if (pathname === '/checkout') return;
    if (!smDown) return;
    if (cartModalOpen) return setCartModalOpen(false);
    setCategoriesOpen(false);
    setAccountModalOpen(false);
    setCartModalOpen(true);
  };

  const toggleAccountModalOpen = () => {
    if (accountModalOpen) return setAccountModalOpen(false);
    setCategoriesOpen(false);
    setAccountModalOpen(true);
    setCartModalOpen(false);
  };
  const toggleCategoriesModalOpen = () => {
    if (categoriesOpen) return setCategoriesOpen(false);
    setAccountModalOpen(false);
    setCartModalOpen(false);
    setCategoriesOpen(true);
  };

  const handleAccountButtonClick = (destination: string = '/orders') => {
    if (isAuthenticated) return router.push(destination);
    const options = {
      onSuccess: () => router.push(destination),
    };
    openAuthenticator(options);
  };

  const handleLinkClick = (link: ShopHeaderLink) => {
    if (link.slug?.startsWith('http')) {
      router.push(link.slug);
      return;
    }
    router.push(`/${link.slug ?? ''}`);
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
      navbarRef.current.style.top = `${
        shouldKeepCompactHeaderVisible
            ? scrolled
            ? -ANNOUNCEMENT_HEIGHT
            : 0
          : hidden
            ? -headerHeight.xs - ANNOUNCEMENT_HEIGHT
            : scrolled
              ? -ANNOUNCEMENT_HEIGHT
              : 0
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
    if (!isMobileSearchRoute) setMobileSearchInputOpen(false);
  }, [isMobileSearchRoute]);

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
    if (newProductAdded) setCartModalOpen(true);
  }, [newProductAdded]);

  useEffect(() => {
    if (!bannerLinks.length || typeof window === 'undefined') return;

    const calculateMarqueeMetrics = () => {
      const cycleWidth = marqueeMeasureRef.current?.scrollWidth ?? 0;
      if (!cycleWidth) return;

      const viewportWidth = window.innerWidth;
      const targetWidth = viewportWidth * 2;
      const nextRepeatCount = Math.max(2, Math.ceil(targetWidth / cycleWidth) + 1);

      setMarqueeCycleWidth((prev) => (prev === cycleWidth ? prev : cycleWidth));
      setMarqueeRepeatCount((prev) => (prev === nextRepeatCount ? prev : nextRepeatCount));
    };

    calculateMarqueeMetrics();
    const rafId = window.requestAnimationFrame(calculateMarqueeMetrics);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(calculateMarqueeMetrics) : null;
    if (marqueeMeasureRef.current) resizeObserver?.observe(marqueeMeasureRef.current);
    window.addEventListener('resize', calculateMarqueeMetrics);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', calculateMarqueeMetrics);
      resizeObserver?.disconnect();
    };
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
              {marqueeLinks.length ? (
                <>
                  <Stack
                    sx={styles.bannerMarquee}
                    style={
                      {
                        ['--banner-marquee-shift' as string]: `${marqueeCycleWidth}px`,
                        ['--banner-marquee-duration' as string]: `${marqueeDuration}s`,
                      } as CSSProperties
                    }
                  >
                    {marqueeLinks.map((e, index) => (
                      <MenuItem
                        sx={styles.bannerLink}
                        onClick={() => handleLinkClick(e)}
                        key={`${e.label}-${index}`}
                      >
                        {e.label}
                      </MenuItem>
                    ))}
                  </Stack>
                  <Stack sx={styles.bannerMeasure} ref={marqueeMeasureRef}>
                    {bannerLinks.map((e, index) => (
                      <MenuItem sx={styles.bannerLink} key={`${e.label}-measure-${index}`}>
                        {e.label}
                      </MenuItem>
                    ))}
                  </Stack>
                </>
              ) : null}
            </Stack>
          </Stack>
          )}
          <Stack sx={styles.content}>
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
              {smDown ? (
                <>
                  {isMobileApp && pathname?.includes('/product/') ? (
                    <IconButton onClick={() => router.back()} aria-label="Geri">
                      <ArrowLeft size={24} />
                    </IconButton>
                  ) : (
                    <IconButton onClick={toggleCategoriesModalOpen} aria-label="Kategoriler">
                      <Menu size={26} />
                    </IconButton>
                  )}
                  <Stack flex={1} alignItems="center" onClick={() => router.push('/')} sx={{ cursor: 'pointer' }}>
                    <Image
                      src={styles.logo.src}
                      alt="mitenya"
                      width={styles.logo.width}
                      height={styles.logo.height}
                      style={styles.logo}
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    {isSearchRoute && (
                      <IconButton
                        onClick={() => setMobileSearchInputOpen((prev) => !prev)}
                        aria-label="Arama"
                      >
                        <Search size={24} />
                      </IconButton>
                    )}
                    <IconButton onClick={toggleAccountModalOpen} aria-label="Hesap">
                      <CircleUser size={24} />
                    </IconButton>
                    <IconButton onClick={toggleCartModalOpen} aria-label="Sepet">
                      <Badge
                        badgeContent={numItems}
                        color="error"
                        sx={{ '& .MuiBadge-badge': { minWidth: 18, height: 18, fontSize: 11, px: 0.5 } }}
                      >
                        <ShoppingBag size={24} />
                      </Badge>
                    </IconButton>
                  </Stack>
                </>
              ) : (
                <>
                  {isMobileApp && pathname?.includes('/product/') ? (
                    <MenuItem onClick={() => router.back()} sx={styles.backButton}>
                      <ArrowLeft size={24} />
                    </MenuItem>
                  ) : (
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Collapse
                        in={collapseIn}
                        orientation="horizontal"
                        unmountOnExit
                        onClick={() => router.push('/')}
                        sx={{
                          pr: !logoCollapsed || smUp ? 4 : 0,
                          mr: { sm: 2 },

                          '& .MuiCollapse-wrapperInner': {
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                          },

                          '& .MuiCollapse-wrapper': {
                            height: 40,
                          },
                        }}
                      >
                        <Image
                          src={styles.logo.src}
                          alt="mitenya"
                          width={styles.logo.width}
                          height={styles.logo.height}
                          style={styles.logo}
                        />
                      </Collapse>
                    </Stack>
                  )}
                  <Stack direction="row" gap={1} width="100%" justifyContent="center">
                    <SearchBar
                      onFocus={() => setLogoCollapsed(true)}
                      onBlur={() => setLogoCollapsed(false)}
                    />
                  </Stack>
                  {mounted && (
                    <Stack sx={styles.actions}>
                      <MenuItem sx={styles.action} onClick={() => handleAccountButtonClick()}>
                        <User />
                        {isAuthenticated ? 'Hesabım' : 'Giriş Yap'}
                      </MenuItem>
                      <ShoppingCartButton />
                    </Stack>
                  )}
                </>
              )}
                </>
              )}
            </Stack>
            {!isMinimal && mounted && smDown && (!isMobileSearchRoute || mobileSearchInputOpen) && (
              <SearchBar autoFocus={isMobileSearchRoute} />
            )}
            {!isMinimal && mounted && smUp && (
              <Stack sx={styles.secondaryBar}>
                <Stack sx={styles.shopHeaderLinks}>
                  {data?.categories?.map((cat, index) => (
                    <MenuItem
                      key={cat.id}
                      sx={styles.shopHeaderLink}
                      onMouseEnter={() => setActiveCategory(index)}
                      onClick={() => cat.slug && router.push(`/${cat.slug}`)}
                    >
                      {cat.label}
                    </MenuItem>
                  ))}
                </Stack>

                {activeCategory !== null && data?.categories?.[activeCategory] && (
                  <Box onMouseLeave={() => setActiveCategory(null)} sx={styles.megaMenu}>
                    <Box sx={styles.megaMenuGrid}>
                      {data.categories[activeCategory].subs?.map((sub) => (
                        <Stack key={sub.id} sx={styles.megaMenuGroup}>
                          <Typography sx={styles.megaMenuTitle}>{sub.label}</Typography>
                          {sub.items?.map((item) => (
                            <Typography
                              key={item.id}
                              sx={styles.megaMenuItem}
                              onClick={() => item.slug && router.push(`/${item.slug}`)}
                            >
                              {item.label}
                            </Typography>
                          ))}
                        </Stack>
                      ))}
                    </Box>
                  </Box>
                )}
              </Stack>
            )}
          </Stack>
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
            sx={{ '& .MuiBottomNavigationAction-root': { px: 0, minWidth: 0 } }}
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
              icon={<CircleUser />}
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
        <>
          <ModalCard
            keepMounted={smDown}
            open={cartModalOpen}
            onClose={() => setCartModalOpen(false)}
            showCloseIcon
            title="Sepet"
            CardProps={{
              sx: {
                height: '100%',
                pb: 12,
                width: { sm: isCartEmpty ? '100%' : undefined },
                maxWidth: { sm: isCartEmpty ? '100%' : undefined },
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
            onOrders={() => handleAccountButtonClick('/orders')}
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
}

const SearchBar = ({ onFocus, onBlur, autoFocus }: SearchBarProps) => {
  const styles = useStyles();
  const router = useRouter();
  const { smUp } = useScreen();
  const searchParams = useSearchParams()!;
  const pathname = usePathname();
  const [query, setQuery] = useState((!searchParams.get('nt') && searchParams.get('query')) || '');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');
  const { searchHistory, addSearchQuery, removeSearchQuery, clearAllHistory } =
    useContext(ShopContext);
  const searchHistoryRef = useRef<HTMLDivElement>(null);
  const placeholderPhrases = [
    'Bugun kendini simart, favorini kesfet.',
    'Sepetine ekle, pariltiyi hemen hisset.',
    'Yeni gelenleri kacirma, tukenmeden yakala.',
  ];

  useEffect(() => {
    setQuery('');
  }, [pathname]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    addSearchQuery(query);
    setShowHistory(false);
    router.push(searchUrlFromOptions({ query }, query === searchParams.get('query')));
  };

  useEffect(() => {
    setLoading(false);
  }, [searchParams, pathname]);

  useEffect(() => {
    if (!smUp || isFocused || query) {
      setAnimatedPlaceholder('');
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phrase = placeholderPhrases[phraseIndex];

      if (!deleting) {
        charIndex += 1;
        setAnimatedPlaceholder(phrase.slice(0, charIndex));
        if (charIndex === phrase.length) {
          deleting = true;
          timeoutId = setTimeout(tick, 1200);
          return;
        }
      } else {
        charIndex -= 1;
        setAnimatedPlaceholder(phrase.slice(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % placeholderPhrases.length;
        }
      }

      timeoutId = setTimeout(tick, deleting ? 40 : 80);
    };

    timeoutId = setTimeout(tick, 400);
    return () => clearTimeout(timeoutId);
  }, [smUp, isFocused, query]);
  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    setShowHistory(false);
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
    <Stack component="form" onSubmit={handleSubmit} sx={styles.searchBar} autoComplete="off">
      <TextField
        fullWidth
        size="small"
        autoComplete="off"
        autoFocus={autoFocus}
        value={query}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        onClick={() => setShowHistory(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowHistory(true);
        }}
        placeholder={smUp && !query && !isFocused ? animatedPlaceholder : ''}
        sx={styles.searchBarInput}
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
                    <X color="neutral" />
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
