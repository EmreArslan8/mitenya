'use client';

import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Giriş yapılırken bir hata oluştu';

  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Giriş Hatası</h1>
      <p className="text-center text-text-medium-light">{message}</p>
      <div className="flex gap-4">
        <Link href="/">
          <Button variant="outlined">Ana Sayfaya Dön</Button>
        </Link>
        <Link href="/">
          <Button variant="contained">Tekrar Dene</Button>
        </Link>
      </div>
    </main>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
