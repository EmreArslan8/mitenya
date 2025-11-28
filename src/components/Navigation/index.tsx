'use client';

import CartPageView from '@/app/cart/view';
import Icon from '@/components/Icon';
import Button from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import { ShopContext } from '@/contexts/ShopContext';
import { ShopHeaderData, ShopHeaderLink } from '@/lib/api/types';
import { useIsMobileApp } from '@/lib/hooks/useIsMobileApp';
import useScreen from '@/lib/hooks/useScreen';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import { signOut } from '@/lib/utils/signOut';
import { bannerHeight } from '@/theme/theme';
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
import { FormEvent, useContext, useEffect, useRef, useState } from 'react';
import LoadingOverlay from '../LoadingOverlay';
import ShoppingCartButton from '../ShoppingCart/ShoppingCartButton';
import { CrossFade } from '../common/CrossFade';
import ModalCard from '../common/ModalCard';
import useStyles from './styles';

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

const getSupportUrl = 'https://api.whatsapp.com';




const accountModalRoutes = [
  { label: 'orders', url: '/orders', icon: 'history' },
  { label: 'settings', url: '/settings', icon: 'settings' },
];

interface NavigationProps {
  data: ShopHeaderData | undefined;
}

const Navigation = ({ data }: NavigationProps) => {
  const isMobileApp = useIsMobileApp();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, openAuthenticator } = useAuth();
  const { numItems, newProductAdded } = useContext(ShopContext);
  const { smDown, smUp } = useScreen();
  const prevScrollPosition = useRef(0);
  const navbarRef = useRef<HTMLDivElement>(null);
  const isMobileRef = useRef(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [logoCollapsed, setLogoCollapsed] = useState(false);
  const styles = useStyles();

  const toggleCartModalOpen = () => {
    if (pathname === '/checkout') return;
    if (cartModalOpen && pathname !== '/cart') history.back();
    if (!smDown || pathname === '/cart' || cartModalOpen) return setCartModalOpen(false);
    history.pushState({}, '', '/cart');
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

  const handleAccountButtonClick = (destination: string = '/orders') => {
    if (isAuthenticated) return router.push(destination);
    const options = {
      onSuccess: () => router.push(destination),
    };
    openAuthenticator(options);
  };

  const handleLinkClick = (link: ShopHeaderLink) => {
    link.slug?.startsWith('http') ? router.push(link.slug) : router.push(`/${link.slug ?? ''}`);
  };

  const handleScroll = () => {
    if (!navbarRef.current) return;
    const hidden = window.scrollY > 120 && window.scrollY > prevScrollPosition.current;
    const scrolled = window.scrollY > 0;

    if (isMobileRef.current)
      navbarRef.current.style.top =
        (hidden ? -44 - bannerHeight : scrolled ? -bannerHeight : 0) + 'px';
    else
      navbarRef.current.style.top =
        (hidden ? -52 - bannerHeight : scrolled ? -bannerHeight : 0) + 'px';

    navbarRef.current.style.boxShadow = scrolled ? '0 0 5px #00000010' : 'none';
    prevScrollPosition.current = window.scrollY;
  };



  useEffect(() => {
    isMobileRef.current = smDown;
    if (!smDown || pathname === '/cart') setCartModalOpen(false);
  }, [smDown, pathname, cartModalOpen]);

  useEffect(() => {
    if (newProductAdded) setCartModalOpen(true);
  }, [newProductAdded]);

  return (
    <>
      <Stack sx={styles.container}>
        <Stack sx={styles.innerContainer} ref={navbarRef}>
          <Stack sx={styles.banner}>
            <Stack sx={styles.bannerInnerContainer}>
              {data?.bannerLinks && (
                <Stack sx={styles.bannerLinks}>
                  {data.bannerLinks.map((e) => (
                    <MenuItem
                      sx={styles.bannerLink}
                      onClick={() => handleLinkClick(e)}
                      key={e.label}
                    >
                      {e.label}
                    </MenuItem>
                  ))}
                </Stack>
              )}
              {getSupportUrl && (
                <a href={getSupportUrl!} target="_blank" style={styles.a}>
                  <MenuItem sx={styles.bannerLink}>
                    <Icon name="support_agent" color="primaryDark" fontSize={15} />
                   Yardım
                  </MenuItem>
                </a>
              )}
            </Stack>
          </Stack>
          <Stack sx={styles.content}>
            <Stack sx={styles.primaryBar}>
              {isMobileApp && pathname?.includes('/product/') ? (
                <MenuItem onClick={() => router.back()} sx={styles.backButton}>
                  <Icon name="arrow_back" fontSize={24} />
                </MenuItem>
              ) : (
                <Collapse
                  in={!logoCollapsed || smUp}
                  orientation="horizontal"
                  sx={{ pr: !logoCollapsed || smUp ? 4 : 0, mr: { sm: 2 } }}
                  unmountOnExit
                  onClick={() => router.push('/')}
                >
                  <Image
                    src={styles.logo.src}
                    alt="kozmedo"
                    width={styles.logo.width}
                    height={styles.logo.height}
                    style={styles.logo}
                  />
                </Collapse>
              )}
              <Stack direction="row" gap={1} width="100%" justifyContent="center">
                <SearchBar
                  onFocus={() => setLogoCollapsed(true)}
                  onBlur={() => setLogoCollapsed(false)}
                />
              </Stack>
              {smUp && (
                <Stack sx={styles.actions}>
                  <MenuItem sx={styles.action} onClick={() => handleAccountButtonClick()}>
                    <Icon name="account_circle" fontSize={24} weight={400} />
                    {isAuthenticated ? ('account') : ('Giriş')}
                  </MenuItem>
                  <ShoppingCartButton />
                </Stack>
              )}
            </Stack>
            <Stack sx={styles.secondaryBar}>
              <Stack sx={styles.shopHeaderLinks}>
                {/* {region === 'uz' && (
                  <Stack direction="row" gap={1}>
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 1,
                        backgroundColor: '#FC2647',
                        color: '#fff',
                        borderRadius: 0.5,
                        px: 1,
                        py: 0.5,
                        cursor: 'pointer',
                        animation: `${pulseAnimation} 3s infinite`,
                      }}
                      onClick={() => router.push('/search?category=181%2C245&ph=30')}
                    >
                      <Typography variant="body" fontWeight={600} zIndex={1} noWrap>
                        {locale === 'ru' ? 'Скидки' : 'Chegirmalar'}
                      </Typography>
                    </Stack>
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 1,
                        background: 'linear-gradient(102.11deg, #71A63C 2.24%, #BEDC9F 98.95%)',
                        color: '#fff',
                        borderRadius: 0.5,
                        px: 1,
                        py: 0.5,
                        cursor: 'pointer',
                        animation: `${pulseAnimation} 3s infinite`,
                      }}
                      onClick={() => router.push('/supplements-vitamins')}
                    >
                      <Typography variant="body" fontWeight={600} zIndex={1} noWrap>
                        {locale === 'ru' ? 'Добавки и витамины' : "Qo'shimchalar va vitaminlar"}
                      </Typography>
                    </Stack>
                  </Stack>
                )} */}
                {data?.links?.map((e) => (
                  <MenuItem
                    selected={pathname === `/${e.slug}` || (!pathname && !e.slug)}
                    onClick={() => handleLinkClick(e)}
                    sx={styles.shopHeaderLink}
                    key={e.label}
                  >
                    {e.label}
                  </MenuItem>
                ))}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      {smDown && (
        <Stack sx={styles.bottomNavigation}>
          <BottomNavigation
            showLabels
            value={
              cartModalOpen || pathname === '/checkout'
                ? '/cart'
                : accountModalOpen || accountModalRoutes.some((e) => pathname?.startsWith(e.url))
                ? '/account'
                : categoriesOpen
                ? 'categories'
                : pathname
            }
            sx={{ '& .MuiBottomNavigationAction-root': { px: 0, minWidth: 0 } }}
          >
            <BottomNavigationAction
              value="/"
              label={('home')}
              icon={<Icon name="home" />}
              onClick={() => {
                if (!((cartModalOpen || accountModalOpen) && pathname === '/')) router.push('/');
                setAccountModalOpen(false);
                setCartModalOpen(false);
                setCategoriesOpen(false);
              }}
            />
            <BottomNavigationAction
              value="categories"
              label={('categories')}
              icon={<Icon name="manage_search" fontSize={29} weight={330} sx={{ m: '-2.5px' }} />}
              onClick={() => {
                setAccountModalOpen(false);
                setCartModalOpen(false);
                setCategoriesOpen((prev) => !prev);
              }}
            />
            <BottomNavigationAction
              value="/cart"
              label= "cart"
              icon={<Icon name="shopping_bag" />}
              onClick={toggleCartModalOpen}
            />
            <BottomNavigationAction
              value="/account"
              label={('account')}
              icon={<Icon name="account_circle" />}
              onClick={toggleAccountModalOpen}
            />
            <BottomNavigationAction
              value="chat"
              label={('help')}
              icon={
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{ '& .MuiBadge-badge': { minWidth: 18, height: 18, mt: '2px', px: 0.5 } }}
                >
                  <Icon name="support_agent" />
                </Badge>
              }
              onClick={() => {
               // Crisp.chat.show();
               // Crisp.chat.open();
              }}
            />
          </BottomNavigation>
        </Stack>
      )}
      <ModalCard
        keepMounted={smDown}
        open={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        showCloseIcon
        title={('cartModalTitle')}
        CardProps={{ sx: { height: '100%', pb: 12 } }}
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
        title={('account')}
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
                  <Icon name="logout" /> {('logout')}
                </MenuItem>
              ) : (
                <MenuItem onClick={() => openAuthenticator()} sx={styles.loginButton}>
                  <Icon name="login" /> {('auth.login')}
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
                <Icon name={e.icon} fill={pathname?.startsWith(e.url)} />
                {(`routes.${e.label}`)}
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
                <Icon name="support_agent" /> {('help')}
              </MenuItem>
            </Grid>
          )}
          <Grid item xs={6}>
            <MenuItem
              component="a"
              href={`https://help.kozmedo.com/`}
              target="_blank"
              sx={styles.accountMenuItem}
            >
              <Icon name="help" /> {('faq')}
            </MenuItem>
          </Grid>
        </Grid>
      </ModalCard>
    </>
  );
};

interface SearchBarProps {
  onFocus?: () => void;
  onBlur?: () => void;
}

const SearchBar = ({ onFocus, onBlur }: SearchBarProps) => {
  const styles = useStyles();
  const router = useRouter();
  const { smUp } = useScreen();
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
    setShowHistory(false);
    router.push(searchUrlFromOptions({ query }, query === searchParams.get('query')));
  };

  useEffect(() => {
    setLoading(false);
  }, [searchParams, pathname]);
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
        value={query}
        onFocus={onFocus}
        onBlur={onBlur}
        onClick={() => setShowHistory(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowHistory(true);
        }}
        placeholder={"palceholder"}
        sx={styles.searchBarInput}
        InputProps={{
          endAdornment: (
            <IconButton type="submit" size="small">
              <Icon name="search" color="primary" fontSize={20} weight={500} />
            </IconButton>
          ),
        }}
      />
      <LoadingOverlay loading={loading} />
      {showHistory && searchHistory.length > 0 && (
        <Box sx={styles.historyContainer} ref={searchHistoryRef} id="search-history-container">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" fontWeight="bold">
              {('searchHistory')}
            </Typography>
            <Button size="small" color="neutral" sx={{ mx: -2 }} onClick={clearAllHistory}>
              {('clearHistory')}
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
                    <Icon name="close" color="neutral" />
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
