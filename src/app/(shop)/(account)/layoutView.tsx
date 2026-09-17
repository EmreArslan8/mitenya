'use client';

import {
  Bell,
  BookUser,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Hand,
  Heart,
  LockKeyhole,
  LogIn,
  MapPinned,
  MessageSquareText,
  PackageSearch,
  UserRound,
} from '@/components/icons';
import type { ComponentType, SVGProps } from 'react';

import SupportButton from '@/components/SupportButtonSimple';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

const getSupportUrl = 'https://api.whatsapp.com/send?phone=905070617930';
type NavItem = {
  label: string;
  url?: string;
  external?: boolean;
  section?: 'profile' | 'addresses' | 'security' | 'notifications' | 'favorites';
  Icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Siparişlerim',
    items: [
      { label: 'Tüm Siparişlerim', url: '/orders', Icon: PackageSearch },
      { label: 'Değerlendirmelerim', url: '/orders?section=reviews', Icon: MessageSquareText },
    ],
  },
  {
    title: 'Hesabım & Yardım',
    items: [
      { label: 'Kullanıcı Bilgilerim', url: '/settings?section=profile', section: 'profile', Icon: UserRound },
      { label: 'Adres Bilgilerim', url: '/settings?section=addresses', section: 'addresses', Icon: MapPinned },
      { label: 'Favorilerim', url: '/settings?section=favorites', section: 'favorites', Icon: Heart },
      { label: 'Kayıtlı Kartlarım', Icon: CreditCard },
      { label: 'Duyuru Tercihlerim', url: '/settings?section=notifications', section: 'notifications', Icon: Bell },
      { label: 'Şifre Değişikliği', url: '/settings?section=security', section: 'security', Icon: LockKeyhole },
      { label: 'Aktif Oturumlarım', Icon: BookUser },
      { label: 'Yardım', url: getSupportUrl, external: true, Icon: CircleHelp },
    ],
  },
];

const AccountPagesLayoutView = ({ children, reviewCount }: { children: ReactNode; reviewCount: number }) => {
  const { isAuthenticated, openAuthenticator, customerData } = useAuth();
  const pathname = usePathname();
  const safePathname = pathname ?? '';
  const searchParams = useSearchParams();
  const selectedSection = searchParams?.get('section') ?? 'profile';
  const router = useRouter();

  const isItemSelected = (item: NavItem) => {
    if (!item.url) return false;
    if (item.url === '/orders?section=reviews') {
      return safePathname.startsWith('/orders') && selectedSection === 'reviews';
    }
    if (item.url.startsWith('/orders')) {
      return safePathname.startsWith('/orders') && selectedSection !== 'reviews';
    }
    if (item.url.startsWith('/settings')) {
      return safePathname.startsWith('/settings') && (!item.section || selectedSection === item.section);
    }
    return false;
  };

  const handleNavClick = (item: NavItem) => {
    if (!item.url) return;
    if (item.external) {
      window.open(item.url, '_blank');
      return;
    }
    router.push(item.url);
  };

  if (isAuthenticated === undefined) return null;

  if (isAuthenticated === false)
    return (
      <div className="flex flex-col items-center gap-6 overflow-hidden py-12 text-center sm:py-20">
        <div className="grid size-[88px] place-items-center rounded-[22px] bg-[linear-gradient(135deg,var(--color-bg-dark)_0%,var(--color-gray-100)_100%)]">
          <Hand size={40} strokeWidth={1.2} color="#8E8E93" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-[-0.3px] text-text sm:text-2xl">
            Giriş Yapın
          </h1>
          <p className="max-w-[400px] text-[15px] font-medium leading-relaxed text-text-medium-light sm:text-base">
            Siparişlerinizi, adreslerinizi ve hesap bilgilerinizi görüntülemek için giriş yapmanız gerekiyor.
          </p>
        </div>

        <div className="flex w-full max-w-[380px] flex-col gap-2 sm:flex-row [&>*]:flex-1">
          <SupportButton variant="outlined" color="secondary" />
          <Button
            variant="contained"
            startIcon={<LogIn size={18} />}
            onClick={() => openAuthenticator()}
          >
            Giriş Yap
          </Button>
        </div>
      </div>
    );

  return (
    <div className="flex w-full flex-col gap-4 sm:flex-row sm:gap-6 md:gap-8">
      <nav className="hidden h-fit w-[232px] shrink-0 flex-col gap-2 rounded-2xl bg-transparent p-2 sm:flex md:w-60 lg:w-[248px]">
          <div className="rounded-xl border border-gray-200 bg-white px-2.5 py-2">
            <p className="text-[17px] font-semibold leading-tight text-text">{customerData?.fullName || 'Kullanıcı'}</p>
          </div>
          {navGroups.map((group, groupIndex) => (
            <div key={group.title} className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-1.5">
              <h2 className="px-1 py-0.5 text-base font-semibold leading-tight tracking-[-0.1px] text-text">{group.title}</h2>
              <div>
                {group.items.map((item) => {
                  const selected = isItemSelected(item);
                  const isDisabled = !item.url;
                  return (
                    <button
                      type="button"
                      key={item.label}
                      disabled={isDisabled}
                      onClick={() => handleNavClick(item)}
                      className={cn('flex min-h-[38px] w-full items-center gap-[7px] rounded-[9px] px-1.5 py-1 text-left text-[13px] transition disabled:cursor-default disabled:opacity-100', selected ? 'bg-bg-dark font-medium text-text' : 'text-text-medium-light hover:bg-bg-dark hover:text-text')}
                    >
                      <span className={cn('flex size-[26px] shrink-0 items-center justify-center rounded-[7px] border border-gray-200', selected ? 'bg-text' : 'bg-white')}>
                        <item.Icon
                          size={16}
                          color={selected ? '#fff' : '#8E8E93'}
                          strokeWidth={selected ? 2.2 : 1.8}
                        />
                      </span>
                      <span className="flex-1 text-[13px] font-normal leading-tight text-inherit">{item.label}</span>
                      {item.label === 'Değerlendirmelerim' && reviewCount > 0
                        ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gray-100 px-1 text-[11px] font-extrabold text-text">{reviewCount}</span>
                        : !isDisabled && <ChevronRight size={14} color="#8E8E93" />}
                    </button>
                  );
                })}
              </div>
              {groupIndex < navGroups.length - 1 && <hr className="mx-0.5 my-1.5 border-0 border-t border-gray-200" />}
            </div>
          ))}
      </nav>
      {children}
    </div>
  );
};

export default AccountPagesLayoutView;
