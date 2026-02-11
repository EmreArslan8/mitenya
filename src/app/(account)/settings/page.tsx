import TwoColumnLayout, {
  PrimaryColumn,
  SecondaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import AddressbookCard from '@/components/settings/AddressbookCard';
import AccountCard from '@/components/settings/AccountCard';
import { fetchAddresses } from '@/lib/api/addresses';
import { Stack, Typography } from '@mui/material';

const SettingsPage = async () => {
  const addresses = (await fetchAddresses()) ?? [];
  return (
    <Stack gap={4} width="100%">
      {/* Header */}
      <Stack gap={1}>
        <Typography
          variant="h2"
          sx={{ fontSize: { xs: 22, sm: 26 }, fontWeight: 800, letterSpacing: -0.3 }}
        >
          Hesap Ayarları
        </Typography>
        <Typography
          sx={{
            color: 'text.mediumLight',
            fontSize: 15,
            fontWeight: 500,
            maxWidth: 480,
            lineHeight: 1.5,
          }}
        >
          Kişisel bilgilerinizi ve adres defterinizi yönetin.
        </Typography>
      </Stack>

      <TwoColumnLayout>
        <PrimaryColumn>
          <AddressbookCard addresses={addresses} />
        </PrimaryColumn>
        <SecondaryColumn>
          <AccountCard />
        </SecondaryColumn>
      </TwoColumnLayout>
    </Stack>
  );
};

export const metadata = {
  title: 'Hesap Ayarları',
  description: 'Hesap bilgilerinizi ve adres defterinizi yönetin.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default SettingsPage;
