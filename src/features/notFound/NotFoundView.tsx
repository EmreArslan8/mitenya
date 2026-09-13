'use client';

import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const NotFoundView = () => {
  return (
    <main className="flex flex-col items-center px-4 py-14 text-center md:py-24">
      <p className="select-none text-[clamp(84px,18vw,168px)] font-extrabold leading-[0.85] tracking-[-0.05em] text-text" aria-hidden>
        4<span className="text-accentRed">0</span>4
      </p>

      <h1 className="mt-6 text-[22px] font-semibold leading-tight text-text md:mt-8 md:text-[28px]">
        Aradığın sayfayı bulamadık
      </h1>
      <p className="mt-2 max-w-[440px] text-sm leading-normal text-text-medium-light md:text-base">
        Bağlantı taşınmış, adı değişmiş ya da hiç var olmamış olabilir.
      </p>

      <div className="mt-6 flex w-full max-w-[440px] flex-col gap-3 sm:flex-row md:mt-8 [&>*]:flex-1">
        <Button variant="contained" href="/" className="py-3">
          Ana Sayfaya Dön
        </Button>
        <Button variant="outlined" color="secondary" href="/search" className="py-3">
          Ürünleri Keşfet
        </Button>
      </div>

      <p className="mt-6 text-[13px] text-text-medium-light">
        Yardıma mı ihtiyacın var?{' '}
        <Link href="/iletisim" className="text-inherit underline underline-offset-3">
          Bize ulaş
        </Link>
      </p>
    </main>
  );
};

export default NotFoundView;
