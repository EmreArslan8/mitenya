import { fetchAddresses } from '@/lib/api/addresses';
import SettingsView from './view';

type SettingsSection = 'profile' | 'addresses' | 'security' | 'notifications';

const VALID_SECTIONS: SettingsSection[] = ['profile', 'addresses', 'security', 'notifications'];

const SettingsPage = async ({
  searchParams,
}: {
  searchParams?: { section?: string };
}) => {
  const addresses = (await fetchAddresses()) ?? [];
  const sectionParam = searchParams?.section;
  const section = VALID_SECTIONS.includes(sectionParam as SettingsSection)
    ? (sectionParam as SettingsSection)
    : 'profile';

  return <SettingsView addresses={addresses} section={section} />;
};

export const metadata = {
  title: 'Hesabım',
  description: 'Profil bilgilerinizi ve adreslerinizi yönetin.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default SettingsPage;
