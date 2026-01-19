'use client';

// 1. Gerekli Lucide ikonlarını direkt import ediyoruz
import { 
  History, 
  Settings, 
  Hand, 
  LogIn, 
  Headset, 
  CircleHelp 
} from 'lucide-react';

import SupportButton from '@/components/SupportButtonSimple';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { useAuth } from '@/contexts/AuthContext';
import useScreen from '@/lib/hooks/useScreen';
import { MenuItem, Stack, Typography, Box, useTheme } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import useStyles from './styles';

// 2. Routes dizisini ikon bileşenlerini içerecek şekilde güncelliyoruz
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
  const theme = useTheme(); 
  if (isAuthenticated === undefined || (!smDown && !smUp)) return <></>;

  if (isAuthenticated === false)
    return (
      <Stack gap={2} textAlign="center" alignItems="center" overflow="hidden">
        {/* Lucide Hand İkonu */}
        <Hand size={80} strokeWidth={1} color={theme.palette.text.secondary} />
        
        <Typography variant="h4" fontWeight="bold">
          Hesabınıza erişmek için giriş yapın
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.
        </Typography>
        
        <Stack direction={{ sm: 'row' }} gap={1} width="100%" maxWidth={450} sx={{ mt: 1 }}>
          <SupportButton variant="outlined" color="secondary" sx={{ flex: 1 }} />
          <Button
            variant="contained"
            // StartIcon prop'una direkt Lucide bileşeni veriyoruz
            startIcon={<LogIn size={20} />} 
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
        <Card border sx={styles.navigation}>
          {routes.map((item) => {
            const isSelected = safePathname.startsWith(item.url);
            const iconColor = isSelected ? theme.palette.primary.main : 'currentColor';
            return (
              <MenuItem
                selected={isSelected}
                onClick={() => router.push(item.url)}
                sx={{
                  ...styles.menuItem,
                  color: isSelected ? 'primary.main' : 'inherit',
                  fontWeight: isSelected ? 600 : 400
                }}
                key={item.label}
              >
                {/* İkon hizalaması için Box içinde render ediyoruz */}
                <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                  <item.Icon 
                    size={24} 
                    color={iconColor}
                    strokeWidth={isSelected ? 2.5 : 2} // Seçiliyse biraz daha kalın
                  />
                </Box>
                {item.label}
              </MenuItem>
            );
          })}
          
          {getSupportUrl && (
            <>
              <MenuItem component="a" href={getSupportUrl} target="_blank" sx={styles.menuItem}>
                <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                  <Headset size={24} />
                </Box>
                Yardım
              </MenuItem>
              <MenuItem component="a" href="https://help.mitenya.com/" target="_blank" sx={styles.menuItem}>
                <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                  <CircleHelp size={24} />
                </Box>
                SSS
              </MenuItem>
            </>
          )}
        </Card>
      )}
      {children}
    </Stack>
  );
};

export default AccountPagesLayoutView;