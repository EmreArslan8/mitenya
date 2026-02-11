'use client';

import {
  History,
  Settings,
  Hand,
  LogIn,
  Headset,
  CircleHelp,
} from 'lucide-react';

import SupportButton from '@/components/SupportButtonSimple';
import Button from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import useScreen from '@/lib/hooks/useScreen';
import { MenuItem, Stack, Typography, Box, Divider } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import useStyles from './styles';

const routes = [
  { label: 'Siparişlerim', url: '/orders', Icon: History },
  { label: 'Hesap Ayarları', url: '/settings', Icon: Settings },
];

const getSupportUrl = 'https://api.whatsapp.com';

const AccountPagesLayoutView = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, openAuthenticator } = useAuth();
  const { smDown, smUp } = useScreen();
  const styles = useStyles();
  const pathname = usePathname();
  const safePathname = pathname ?? '';
  const router = useRouter();

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
            Siparişlerinizi görüntülemek ve hesap ayarlarınızı yönetmek için giriş yapmanız gerekiyor.
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
          {routes.map((item) => {
            const isSelected = safePathname.startsWith(item.url);
            return (
              <MenuItem
                selected={isSelected}
                onClick={() => router.push(item.url)}
                sx={styles.menuItem}
                key={item.label}
              >
                <Box
                  sx={{
                    ...styles.menuItemIcon,
                    bgcolor: isSelected ? 'text.main' : 'transparent',
                  }}
                >
                  <item.Icon
                    size={16}
                    color={isSelected ? '#fff' : '#8E8E93'}
                    strokeWidth={isSelected ? 2.2 : 1.8}
                  />
                </Box>
                {item.label}
              </MenuItem>
            );
          })}

          {getSupportUrl && (
            <>
              <Divider sx={styles.divider} />

              <MenuItem
                component="a"
                href={getSupportUrl}
                target="_blank"
                sx={styles.menuItem}
              >
                <Box sx={{ ...styles.menuItemIcon }}>
                  <Headset size={16} color="#8E8E93" strokeWidth={1.8} />
                </Box>
                Yardım
              </MenuItem>
              <MenuItem
                component="a"
                href="mailto:destek@mitenya.com"
                target="_blank"
                sx={styles.menuItem}
              >
                <Box sx={{ ...styles.menuItemIcon }}>
                  <CircleHelp size={16} color="#8E8E93" strokeWidth={1.8} />
                </Box>
                SSS
              </MenuItem>
            </>
          )}
        </Stack>
      )}
      {children}
    </Stack>
  );
};

export default AccountPagesLayoutView;
