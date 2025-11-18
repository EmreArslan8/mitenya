'use client';

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
import Categories from './Categories';
import useStyles from './styles';
import CartPageView from '@/app/cart/view';

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1); }
  75% { transform: scale(0.95); }
  100% { transform: scale(1); }
`;

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

  const prevScroll = useRef(0);
  const navbarRef = useRef<HTMLDivElement>(null);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [logoCollapsed, setLogoCollapsed] = useState(false);
  const styles = useStyles();

  const toggleCartModalOpen = () => {
    if (pathname === '/checkout') return;
    if (cartModalOpen && pathname !== '/cart') history.back();
    if (!smDown || pathname === '/cart') return setCartModalOpen(false);

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

  const handleAccountButtonClick = (dest: string = '/orders') => {
    if (isAuthenticated) return router.push(dest);
    openAuthenticator({ onSuccess: () => router.push(dest) });
  };

  const handleLinkClick = (link: ShopHeaderLink) => {
    link.slug?.startsWith('http')
      ? router.push(link.slug)
      : router.push(`/${link.slug ?? ''}`);
  };

  return (
    <>
      <Stack sx={styles.container}>
        <Stack sx={styles.innerContainer} ref={navbarRef}>
          <Stack sx={styles.content}>
            <Stack sx={styles.primaryBar}>
              <Collapse
                in={!logoCollapsed || smUp}
                orientation="horizontal"
                sx={{ pr: !logoCollapsed || smUp ? 4 : 0 }}
                onClick={() => router.push('/')}
              >
                <Image
                  src={styles.logo.src}
                  alt="logo"
                  width={styles.logo.width}
                  height={styles.logo.height}
                  style={styles.logo}
                />
              </Collapse>

              <Stack direction="row" gap={1} width="100%" justifyContent="center">
                {smUp && (
                  <CategoriesButton
                    categoriesOpen={categoriesOpen}
                    onClick={() => setCategoriesOpen((p) => !p)}
                  />
                )}
                <SearchBar
                  onFocus={() => setLogoCollapsed(true)}
                  onBlur={() => setLogoCollapsed(false)}
                />
              </Stack>

              {smUp && (
                <Stack sx={styles.actions}>
                  <MenuItem sx={styles.action} onClick={() => handleAccountButtonClick()}>
                    <Icon name="account_circle" fontSize={24} />
                    {isAuthenticated ? 'Account' : 'Login'}
                  </MenuItem>
                  <ShoppingCartButton />
                </Stack>
              )}
            </Stack>

            <Stack sx={styles.secondaryBar}>
              <Stack sx={styles.shopHeaderLinks}>
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
            value={pathname}
            sx={{ '& .MuiBottomNavigationAction-root': { px: 0, minWidth: 0 } }}
          >
            <BottomNavigationAction
              value="/"
              label="Home"
              icon={<Icon name="home" />}
              onClick={() => router.push('/')}
            />

            <BottomNavigationAction
              value="categories"
              label="Categories"
              icon={<Icon name="menu" />}
              onClick={() => setCategoriesOpen((p) => !p)}
            />

            <BottomNavigationAction
              value="/cart"
              label={`Cart (${numItems})`}
              icon={<Icon name="shopping_bag" />}
              onClick={toggleCartModalOpen}
            />

            <BottomNavigationAction
              value="/account"
              label="Account"
              icon={<Icon name="account_circle" />}
              onClick={toggleAccountModalOpen}
            />
          </BottomNavigation>
        </Stack>
      )}

      <ModalCard open={cartModalOpen} onClose={() => setCartModalOpen(false)}>
        <CartPageView
          hideTitle
          visible={cartModalOpen}
          onContinue={() => setCartModalOpen(false)}
          onItemClick={() => setCartModalOpen(false)}
        />
      </ModalCard>

      <Categories open={categoriesOpen} onClose={() => setCategoriesOpen(false)} />
    </>
  );
};

const CategoriesButton = ({
  categoriesOpen,
  onClick,
}: {
  categoriesOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <Button
      color="blue"
      size="small"
      variant="tonal"
      onClick={onClick}
      startIcon={
        <Box height={24} width={24}>
          <CrossFade
            components={[
              { in: !categoriesOpen, component: <Icon name="menu" /> },
              { in: categoriesOpen, component: <Icon name="close" /> },
            ]}
          />
        </Box>
      }
    >
      Categories
    </Button>
  );
};

const SearchBar = ({
  onFocus,
  onBlur,
}: {
  onFocus?: () => void;
  onBlur?: () => void;
}) => {
  const styles = useStyles();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { smUp } = useScreen();

  const [query, setQuery] = useState(searchParams?.get('query') || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    router.push(searchUrlFromOptions({ query }));
  };

  useEffect(() => setLoading(false), [searchParams, pathname]);

  return (
    <Stack component="form" onSubmit={handleSubmit} sx={styles.searchBar} autoComplete="off">
      <TextField
        fullWidth
        size="small"
        autoComplete="off"
        value={query}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
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
    </Stack>
  );
};

export default Navigation;
