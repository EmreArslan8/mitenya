'use client';

import { Stack, Typography } from '@mui/material';
import Button from '@/components/common/Button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Giriş yapılırken bir hata oluştu';

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      gap={3}
      sx={{ minHeight: '50vh', p: 4 }}
    >
      <Typography variant="h4" component="h1">
        Giriş Hatası
      </Typography>
      <Typography color="text.secondary" textAlign="center">
        {message}
      </Typography>
      <Stack direction="row" gap={2}>
        <Link href="/" passHref>
          <Button variant="outlined">Ana Sayfaya Dön</Button>
        </Link>
        <Link href="/" passHref>
          <Button variant="contained">Tekrar Dene</Button>
        </Link>
      </Stack>
    </Stack>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
