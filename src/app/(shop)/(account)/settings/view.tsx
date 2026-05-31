'use client';

import AddressbookCard from '@/components/settings/AddressbookCard';
import AccountCard from '@/components/settings/AccountCard';
import FavoritesCard from '@/components/settings/FavoritesCard';
import SecurityCard from '@/components/settings/SecurityCard';
import Button from '@/components/common/Button';
import { AddressData } from '@/lib/api/types';
import useScreen from '@/lib/hooks/useScreen';
import { Box, Divider, MenuItem, Select, Stack, Typography } from '@mui/material';
import type { LucideIcon } from 'lucide-react';
import { Bell, Heart, LockKeyhole, MapPinned, PackageSearch, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

type SettingsTab = 'profile' | 'addresses' | 'security' | 'notifications' | 'favorites';
type SectionIcon = LucideIcon;

const TAB_LABELS: Record<SettingsTab, string> = {
  profile: 'Profil Bilgilerim',
  addresses: 'Adreslerim',
  security: 'Güvenlik',
  notifications: 'Bildirimlerim',
  favorites: 'Favorilerim',
};

const TAB_LABELS_MOBILE: Record<SettingsTab, string> = {
  profile: 'Profil',
  addresses: 'Adres',
  security: 'Güvenlik',
  notifications: 'Bildirim',
  favorites: 'Favoriler',
};

const SettingsView = ({ addresses, section }: { addresses: AddressData[]; section: SettingsTab }) => {
  const router = useRouter();
  const { smDown } = useScreen();
  const selectedTitle = useMemo(() => TAB_LABELS[section], [section]);

  const tabMeta = useMemo(
    () =>
      ({
        profile: { label: TAB_LABELS_MOBILE.profile, Icon: UserRound },
        addresses: { label: TAB_LABELS_MOBILE.addresses, Icon: MapPinned },
        security: { label: TAB_LABELS_MOBILE.security, Icon: LockKeyhole },
        notifications: { label: TAB_LABELS_MOBILE.notifications, Icon: Bell },
        favorites: { label: TAB_LABELS_MOBILE.favorites, Icon: Heart },
      }) satisfies Record<SettingsTab, { label: string; Icon: SectionIcon }>,
    []
  );

  return (
    <Stack gap={4} width="100%">
      {/* Mobile section switcher (desktop uses the left navigation in (account)/layoutView.tsx) */}
      {smDown && (
        <>
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              bgcolor: 'bg.light',
              pt: 1.25,
              pb: 1.5,
              // Visual separation from content on scroll
              boxShadow: '0 10px 26px rgba(16,24,40,0.06)',
            }}
          >
            <Box px={1}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 900,
                    letterSpacing: -0.4,
                    color: 'text.main',
                  }}
                >
                  Ayarlar
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  color="neutral"
                  href="/orders"
                  startIcon={<PackageSearch size={16} />}
                  sx={{
                    borderRadius: '999px',
                    textTransform: 'none',
                    fontWeight: 800,
                    px: 1.25,
                    py: 0.6,
                  }}
                >
                  Siparişlerim
                </Button>
              </Stack>

              <Select
                fullWidth
                value={section}
                onChange={(e) => router.push(`/settings?section=${e.target.value as SettingsTab}`)}
                renderValue={(value) => {
                  const meta = tabMeta[value as SettingsTab];
                  const Icon = meta.Icon;
                  return (
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: '10px',
                          bgcolor: 'bg.dark',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <Icon size={18} />
                      </Box>
                      <Typography sx={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.25 }}>
                        {meta.label}
                      </Typography>
                    </Stack>
                  );
                }}
                sx={{
                  bgcolor: 'white.main',
                  borderRadius: '16px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: (theme) => theme.palette.gray[200],
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: (theme) => theme.palette.gray[300],
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'text.main',
                    borderWidth: 2,
                  },
                  '& .MuiSelect-select': {
                    py: 1.1,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      mt: 1,
                      borderRadius: '16px',
                      border: (theme) => `1px solid ${theme.palette.gray[200]}`,
                      boxShadow: '0 20px 60px rgba(16,24,40,0.16)',
                    },
                  },
                }}
              >
                {(Object.keys(tabMeta) as SettingsTab[]).map((key) => {
                  const meta = tabMeta[key];
                  const Icon = meta.Icon;
                  return (
                    <MenuItem key={key} value={key} sx={{ py: 1.1, gap: 1.25 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '10px',
                          bgcolor: 'bg.dark',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <Icon size={18} />
                      </Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{meta.label}</Typography>
                    </MenuItem>
                  );
                })}
              </Select>
            </Box>
          </Box>

          {/* Divider between the selector area and the section content */}
          <Divider
            sx={{
              mx: 1,
              borderColor: (theme) => theme.palette.gray[100],
            }}
          />
        </>
      )}

      {section !== 'addresses' && (
        <Typography variant="h2" sx={{ fontSize: { xs: 24, sm: 28 }, color: 'text.main' }}>
          {selectedTitle}
        </Typography>
      )}

      {section === 'profile' && (
        <Stack width="100%">
          <AccountCard />
        </Stack>
      )}

      {section === 'addresses' && (
        <Stack width="100%">
          <AddressbookCard addresses={addresses} />
        </Stack>
      )}

      {section === 'security' && (
        <Stack width="100%">
          <SecurityCard />
        </Stack>
      )}
      {section === 'notifications' && (
        <SectionPlaceholder title="Bildirim tercihleri yakinda eklenecek." />
      )}
      {section === 'favorites' && (
        <FavoritesCard />
      )}
    </Stack>
  );
};

const SectionPlaceholder = ({ title }: { title: string }) => (
  <Stack
    sx={{
      border: (theme) => `1px solid ${theme.palette.gray[100]}`,
      borderRadius: '14px',
      px: { xs: 2, sm: 2.5 },
      py: { xs: 2.5, sm: 3 },
      width: '100%',
      bgcolor: 'white.main',
      boxShadow: '0 6px 18px rgba(16,24,40,0.05)',
    }}
  >
    <Typography sx={{ color: 'text.main', fontSize: { xs: 14, sm: 15 }, fontWeight: 600 }}>
      {title}
    </Typography>
  </Stack>
);

export default SettingsView;
