'use client';

import {
  Hand,
  LogIn,
  PackageSearch,
  MessageSquareText,
  RotateCcw,
  UserRound,
  MapPinned,
  CreditCard,
  Bell,
  LockKeyhole,
  BookUser,
  CircleHelp,
  ChevronRight,
} from 'lucide-react';

import SupportButton from '@/components/SupportButtonSimple';
import Button from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import useScreen from '@/lib/hooks/useScreen';
import { MenuItem, Stack, Typography, Box, Divider } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';
import useStyles from './styles';

const getSupportUrl = 'https://api.whatsapp.com';
type NavItem = {
  label: string;
  url?: string;
  external?: boolean;
  section?: 'profile' | 'addresses' | 'security' | 'notifications';
  badge?: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Siparislerim',
    items: [
      { label: 'Tum Siparislerim', url: '/orders', Icon: PackageSearch },
      { label: 'Degerlendirmelerim', Icon: MessageSquareText, badge: '3' },
      { label: 'Tekrar Satin Al', url: '/orders', Icon: RotateCcw },
    ],
  },
  {
    title: 'Hesabim & Yardim',
    items: [
      { label: 'Kullanici Bilgilerim', url: '/settings?section=profile', section: 'profile', Icon: UserRound },
      { label: 'Adres Bilgilerim', url: '/settings?section=addresses', section: 'addresses', Icon: MapPinned },
      { label: 'Kayitli Kartlarim', Icon: CreditCard },
      { label: 'Duyuru Tercihlerim', url: '/settings?section=notifications', section: 'notifications', Icon: Bell },
      { label: 'Sifre Degisikligi', url: '/settings?section=security', section: 'security', Icon: LockKeyhole },
      { label: 'Aktif Oturumlarim', Icon: BookUser },
      { label: 'Yardim', url: getSupportUrl, external: true, Icon: CircleHelp },
    ],
  },
];

const AccountPagesLayoutView = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, openAuthenticator, customerData } = useAuth();
  const { smDown, smUp } = useScreen();
  const styles = useStyles();
  const pathname = usePathname();
  const safePathname = pathname ?? '';
  const searchParams = useSearchParams();
  const selectedSection = searchParams?.get('section') ?? 'profile';
  const router = useRouter();

  const isItemSelected = (item: NavItem) => {
    if (!item.url) return false;
    if (item.url.startsWith('/orders')) return safePathname.startsWith('/orders');
    if (item.url.startsWith('/settings')) {
      return safePathname.startsWith('/settings') && (!item.section || selectedSection === item.section);
    }
    return false;
  };

  const handleNavClick = (item: NavItem) => {
    if (!item.url) return;
    if (item.external) {
      window.open(item.url, '_blank');
      return;
    }
    router.push(item.url);
  };

  if (isAuthenticated === undefined || (!smDown && !smUp)) return <></>;

  if (isAuthenticated === false)
    return (
      <Stack sx={styles.authContainer}>
        <Box sx={styles.authIconBox}>
          <Hand size={40} strokeWidth={1.2} color="#8E8E93" />
        </Box>

        <Stack gap={1} alignItems="center">
          <Typography sx={styles.authTitle}>
            Giriş Yapın
          </Typography>
          <Typography sx={styles.authDescription}>
            Siparişlerinizi, adreslerinizi ve hesap bilgilerinizi görüntülemek için giriş yapmanız gerekiyor.
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} width="100%" maxWidth={380}>
          <SupportButton variant="outlined" color="secondary" sx={{ flex: 1 }} />
          <Button
            variant="contained"
            startIcon={<LogIn size={18} />}
            onClick={() => openAuthenticator()}
            sx={{ flex: 1 }}
          >
            Giriş Yap
          </Button>
        </Stack>
      </Stack>
    );

  return (
    <Stack sx={styles.container}>
      {smUp && (
        <Stack sx={styles.navigation}>
          <Stack sx={styles.accountIdentity}>
            <Typography sx={styles.accountName}>{customerData?.fullName || 'Kullanici'}</Typography>
          </Stack>
          {navGroups.map((group, groupIndex) => (
            <Stack key={group.title} sx={styles.groupCard}>
              <Typography sx={styles.groupTitle}>{group.title}</Typography>
              <Stack>
                {group.items.map((item) => {
                  const selected = isItemSelected(item);
                  const isDisabled = !item.url;
                  return (
                    <MenuItem
                      key={item.label}
                      selected={selected}
                      disabled={isDisabled}
                      onClick={() => handleNavClick(item)}
                      sx={styles.menuItem}
                    >
                      <Box
                        sx={{
                          ...styles.menuItemIcon,
                          bgcolor: selected ? 'text.main' : 'transparent',
                        }}
                      >
                        <item.Icon
                          size={16}
                          color={selected ? '#fff' : '#8E8E93'}
                          strokeWidth={selected ? 2.2 : 1.8}
                        />
                      </Box>
                      <Typography sx={styles.menuItemLabel}>{item.label}</Typography>
                      {item.badge && <Box sx={styles.menuBadge}>{item.badge}</Box>}
                      {!item.badge && !isDisabled && <ChevronRight size={14} color="#8E8E93" />}
                    </MenuItem>
                  );
                })}
              </Stack>
              {groupIndex < navGroups.length - 1 && <Divider sx={styles.divider} />}
            </Stack>
          ))}

        </Stack>
      )}
      {children}
    </Stack>
  );
};

export default AccountPagesLayoutView;
