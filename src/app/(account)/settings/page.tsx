import { fetchAddresses } from '@/lib/api/addresses';
import SettingsView from './view';

type SettingsSection = 'profile' | 'addresses' | 'security' | 'notifications' | 'favorites';

const VALID_SECTIONS: SettingsSection[] = ['profile', 'addresses', 'security', 'notifications', 'favorites'];

const SettingsPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ section?: string }>;
}) => {
  const addresses = (await fetchAddresses()) ?? [];
  const resolvedSearchParams = await searchParams;
  const sectionParam = resolvedSearchParams?.section;
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
