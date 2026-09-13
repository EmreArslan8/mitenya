'use client';

import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';

/**
 * Google ile devam et — hem giris hem kayit icin ayni akis.
 * Ilk kez gelen kullaniciya AuthContext otomatik musteri kaydi aciyor.
 */
const GoogleAuthButton = ({ returnUrl }: { returnUrl: string }) => {
  const handleClick = () => {
    window.location.href = `/auth/google/login?next=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="outlined"
        onClick={handleClick}
        fullWidth
        className="rounded-full border-black bg-white py-3 font-semibold normal-case text-black hover:border-black hover:bg-gray-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          width="24"
          height="24"
          src="/static/images/socials/google.svg"
          alt="google-logo"
          className="mr-3"
        />
        Google ile devam et
      </Button>

      <div className="flex items-center gap-4">
        <Divider className="flex-1" />
        <span className="text-sm text-text-medium-light">veya</span>
        <Divider className="flex-1" />
      </div>
    </div>
  );
};

export default GoogleAuthButton;
