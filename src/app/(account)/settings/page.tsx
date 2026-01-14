import TwoColumnLayout, {
  PrimaryColumn,
  SecondaryColumn,
} from '@/components/layouts/TwoColumnLayout';
import AddressbookCard from '@/components/settings/AddressbookCard';
import AccountCard from '@/components/settings/AccountCard';
import { fetchAddresses } from '@/lib/api/addresses';

const SettingsPage = async () => {
  const addresses = (await fetchAddresses()) ?? [];
  return (
    <TwoColumnLayout>
      <PrimaryColumn>
        <AddressbookCard addresses={addresses} />
      </PrimaryColumn>
      <SecondaryColumn>
        <AccountCard />
      </SecondaryColumn>
    </TwoColumnLayout>
  );
};

export const metadata = {
  title: 'Hesap Ayarları',
  description: 'Hesap bilgilerinizi ve adres defterinizi yönetin.',
};

export const dynamic = 'force-dynamic';

export default SettingsPage;
