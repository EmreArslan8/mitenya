'use client';

import Button from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/utils/signOut';
import { Divider, MenuItem, Popover, Stack, SxProps, Typography } from '@mui/material';
import { Headset, History, LogOut, PackageSearch, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

/** Butondan panele geçerken panelin kapanmaması için kısa gecikme. */
const HOVER_CLOSE_DELAY = 160;

const SUPPORT_URL = 'https://api.whatsapp.com/send?phone=905070617930';

const linkSx: SxProps = {
  gap: 1.25,
  px: 0,
  py: 1,
  minHeight: 0,
  fontSize: 14,
  color: 'text.primary',
  '& svg': { width: 18, height: 18, strokeWidth: 1.5 },
  '&:hover': { backgroundColor: 'transparent', opacity: 0.65 },
};

/**
 * Header hesap ikonu — masaüstünde hover ile açılan panel.
 * Girişsizken giriş/üyelik kapısı, girişliyken hesap kısayolları gösterir.
 */
const AccountMenu = ({ triggerSx }: { triggerSx?: SxProps }) => {
  const router = useRouter();
  const { isAuthenticated, customerData, openAuthenticator } = useAuth();
  const anchorRef = useRef<HTMLLIElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);

  const firstName = customerData?.fullName?.trim().split(' ')[0];

  const cancelClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleOpenOnHover = () => {
    cancelClose();
    setOpen(true);
  };

  const handleCloseOnHover = () => {
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY);
  };

  const go = (url: string) => {
    cancelClose();
    setOpen(false);
    router.push(url);
  };

  return (
    <>
      <MenuItem
        ref={anchorRef}
        sx={triggerSx}
        onMouseEnter={handleOpenOnHover}
        onMouseLeave={handleCloseOnHover}
        onClick={() => (isAuthenticated ? go('/orders') : setOpen((prev) => !prev))}
        aria-label={isAuthenticated ? 'Hesabım' : 'Giriş Yap'}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <User />
      </MenuItem>

      <Popover
        elevation={0}
        anchorEl={anchorRef.current}
        open={open}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableRestoreFocus
        /* Hover ile açıldığı için altındaki içeriğin tıklanabilirliği korunuyor. */
        sx={{ pointerEvents: 'none' }}
        slotProps={{
          paper: {
            onMouseEnter: cancelClose,
            onMouseLeave: handleCloseOnHover,
            sx: {
              pointerEvents: 'auto',
              width: 280,
              p: 2.5,
              border: '1px solid',
              borderColor: 'grey.200',
              borderRadius: 0,
            },
          },
        }}
      >
        <Stack gap={2}>
          {isAuthenticated ? (
            <>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                Merhaba{firstName ? `, ${firstName}` : ''}
              </Typography>

              <Stack>
                <MenuItem sx={linkSx} onClick={() => go('/orders')}>
                  <History /> Siparişlerim
                </MenuItem>
                <MenuItem sx={linkSx} onClick={() => go('/settings')}>
                  <Settings /> Ayarlar
                </MenuItem>
              </Stack>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setOpen(false);
                  openAuthenticator();
                }}
              >
                Giriş Yap
              </Button>

              <Stack direction="row" alignItems="center" gap={1}>
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
                  Hesabın yok mu?
                </Typography>
                <Typography
                  component="button"
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openAuthenticator({ type: 'uye-ol' });
                  }}
                  sx={{
                    p: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'text.primary',
                    textDecoration: 'underline',
                    textUnderlineOffset: '4px',
                    '&:hover': { opacity: 0.65 },
                  }}
                >
                  Üye ol
                </Typography>
              </Stack>
            </>
          )}

          <Divider />

          <Stack>
            <MenuItem sx={linkSx} onClick={() => go('/siparis-takip')}>
              <PackageSearch /> Sipariş Takip
            </MenuItem>
            <MenuItem component="a" href={SUPPORT_URL} target="_blank" rel="noopener" sx={linkSx}>
              <Headset /> Destek & Yardım
            </MenuItem>
            {isAuthenticated && (
              <MenuItem sx={linkSx} onClick={signOut}>
                <LogOut /> Çıkış Yap
              </MenuItem>
            )}
          </Stack>
        </Stack>
      </Popover>
    </>
  );
};

export default AccountMenu;
