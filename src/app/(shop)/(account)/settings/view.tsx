'use client';

import AddressbookCard from '@/components/settings/AddressbookCard';
import AccountCard from '@/components/settings/AccountCard';
import FavoritesCard from '@/components/settings/FavoritesCard';
import SecurityCard from '@/components/settings/SecurityCard';
import { Button } from '@/components/ui/Button';
import { AddressData } from '@/lib/api/types';
import { Bell, Heart, LockKeyhole, MapPinned, PackageSearch, UserRound } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useMemo, type ComponentType, type SVGProps } from 'react';
import { Select, SelectItem } from '@/components/ui/Select';

type SettingsTab = 'profile' | 'addresses' | 'security' | 'notifications' | 'favorites';
type SectionIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

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
    <div className="flex w-full flex-col gap-8">
      {/* Mobile section switcher (desktop uses the left navigation in (account)/layoutView.tsx) */}
      <>
          <div className="sticky top-0 z-[2] bg-bg-light pb-3 pt-2.5 shadow-[0_10px_26px_rgba(16,24,40,0.06)] sm:hidden">
            <div className="px-2">
              <div className="mb-2 flex items-center justify-between">
                <h1 className="text-lg font-black tracking-[-0.4px] text-text">
                  Ayarlar
                </h1>
                <Button
                  size="small"
                  variant="outlined"
                  color="neutral"
                  href="/orders"
                  startIcon={<PackageSearch size={16} />}
                  className="rounded-full px-2.5 py-1 text-xs font-extrabold normal-case"
                >
                  Siparişlerim
                </Button>
              </div>

              <Select
                value={section}
                onValueChange={(v) => router.push(`/settings?section=${v as SettingsTab}`)}
                aria-label="Ayar bölümü"
                className="h-auto rounded-[16px] border-gray-200 py-[9px] hover:border-gray-300 focus-visible:border-2 focus-visible:border-text"
                contentClassName="mt-1 rounded-[16px] border-gray-200 shadow-[0_20px_60px_rgba(16,24,40,0.16)]"
                renderValue={(value) => {
                  const meta = tabMeta[value as SettingsTab];
                  const Icon = meta.Icon;
                  return (
                    <span className="flex items-center gap-2">
                      <span className="grid size-[34px] place-items-center rounded-[10px] bg-bg-dark">
                        <Icon size={18} />
                      </span>
                      <span className="text-[16px] font-black tracking-[-0.25px]">{meta.label}</span>
                    </span>
                  );
                }}
              >
                {(Object.keys(tabMeta) as SettingsTab[]).map((key) => {
                  const meta = tabMeta[key];
                  const Icon = meta.Icon;
                  return (
                    <SelectItem key={key} value={key} className="gap-2.5 py-[9px]">
                      <span className="flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-[10px] bg-bg-dark">
                          <Icon size={18} />
                        </span>
                        <span className="text-[15px] font-extrabold">{meta.label}</span>
                      </span>
                    </SelectItem>
                  );
                })}
              </Select>
            </div>
          </div>

          {/* Divider between the selector area and the section content */}
          <hr className="mx-2 border-0 border-t border-gray-100 sm:hidden" />
      </>

      {section !== 'addresses' && (
        <h1 className="text-2xl font-bold text-text sm:text-[28px]">
          {selectedTitle}
        </h1>
      )}

      {section === 'profile' && (
        <div className="w-full">
          <AccountCard />
        </div>
      )}

      {section === 'addresses' && (
        <div className="w-full">
          <AddressbookCard addresses={addresses} />
        </div>
      )}

      {section === 'security' && (
        <div className="w-full">
          <SecurityCard />
        </div>
      )}
      {section === 'notifications' && (
        <SectionPlaceholder title="Bildirim tercihleri yakinda eklenecek." />
      )}
      {section === 'favorites' && (
        <FavoritesCard />
      )}
    </div>
  );
};

const SectionPlaceholder = ({ title }: { title: string }) => (
  <div className="w-full rounded-[14px] border border-gray-100 bg-white px-4 py-5 shadow-[0_6px_18px_rgba(16,24,40,0.05)] sm:px-5 sm:py-6">
    <p className="text-sm font-semibold text-text sm:text-[15px]">
      {title}
    </p>
  </div>
);

export default SettingsView;
