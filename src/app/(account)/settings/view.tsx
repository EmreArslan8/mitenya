'use client';

import AddressbookCard from '@/components/settings/AddressbookCard';
import AccountCard from '@/components/settings/AccountCard';
import SecurityCard from '@/components/settings/SecurityCard';
import { AddressData } from '@/lib/api/types';
import { Stack, Typography } from '@mui/material';
import { useMemo } from 'react';

type SettingsTab = 'profile' | 'addresses' | 'security' | 'notifications';

const TAB_LABELS: Record<SettingsTab, string> = {
  profile: 'Profil Bilgilerim',
  addresses: 'Adreslerim',
  security: 'Guvenlik',
  notifications: 'Bildirimlerim',
};

const SettingsView = ({ addresses, section }: { addresses: AddressData[]; section: SettingsTab }) => {
  const selectedTitle = useMemo(() => TAB_LABELS[section], [section]);

  return (
    <Stack gap={4} width="100%">
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
