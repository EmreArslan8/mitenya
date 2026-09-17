'use client';

import Button from '@/components/ui/Button';
import Divider from '@/components/ui/Divider';
import Popover from '@/components/ui/Popover';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/lib/utils/signOut';
import { Headset, History, LogOut, PackageSearch, Settings, User } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

const HOVER_CLOSE_DELAY = 160;
const SUPPORT_URL = 'https://api.whatsapp.com/send?phone=905070617930';
const itemClass = 'flex min-h-0 w-full items-center gap-2.5 py-2 text-left text-sm text-text hover:opacity-65 [&_svg]:size-[18px] [&_svg]:stroke-[1.5]';

const AccountMenu = ({ triggerClassName }: { triggerClassName?: string }) => {
  const router = useRouter();
  const { isAuthenticated, customerData, openAuthenticator } = useAuth();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const firstName = customerData?.fullName?.trim().split(' ')[0];

  const cancelClose = () => {
    if (!closeTimeoutRef.current) return;
    clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
  };
  const closeLater = () => {
    cancelClose();
    closeTimeoutRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY);
  };
  const go = (url: string) => {
    cancelClose();
    setOpen(false);
    router.push(url);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="end"
      sideOffset={0}
      onMouseEnter={cancelClose}
      onMouseLeave={closeLater}
      className="w-[280px] rounded-none border-gray-200 p-5"
      trigger={
        <button
          type="button"
          className={triggerClassName}
          onMouseEnter={() => { cancelClose(); setOpen(true); }}
          onMouseLeave={closeLater}
          onClick={() => isAuthenticated && go('/orders')}
          aria-label={isAuthenticated ? 'Hesabım' : 'Giriş Yap'}
        >
          <User />
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        {isAuthenticated ? (
          <>
            <p className="text-sm font-semibold">Merhaba{firstName ? `, ${firstName}` : ''}</p>
            <div className="flex flex-col">
              <button type="button" className={itemClass} onClick={() => go('/orders')}><History /> Siparişlerim</button>
              <button type="button" className={itemClass} onClick={() => go('/settings')}><Settings /> Ayarlar</button>
            </div>
          </>
        ) : (
          <>
            <Button fullWidth onClick={() => { setOpen(false); openAuthenticator(); }}>Giriş Yap</Button>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Hesabın yok mu?</span>
              <button
                type="button"
                className="font-semibold underline underline-offset-4 hover:opacity-65"
                onClick={() => { setOpen(false); openAuthenticator({ type: 'uye-ol' }); }}
              >
                Üye ol
              </button>
            </div>
          </>
        )}

        <Divider />
        <div className="flex flex-col">
          <button type="button" className={itemClass} onClick={() => go('/siparis-takip')}><PackageSearch /> Sipariş Takip</button>
          <a className={itemClass} href={SUPPORT_URL} target="_blank" rel="noopener noreferrer"><Headset /> Destek &amp; Yardım</a>
          {isAuthenticated && <button type="button" className={itemClass} onClick={signOut}><LogOut /> Çıkış Yap</button>}
        </div>
      </div>
    </Popover>
  );
};

export default AccountMenu;
