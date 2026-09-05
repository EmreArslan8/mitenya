import { Metadata } from 'next';
import { Suspense } from 'react';
import UyelikView from './view';

export const metadata: Metadata = {
  title: 'Giriş Yap veya Üye Ol | Mitenya',
  description:
    'Mitenya hesabına giriş yap ya da yeni üyelik oluştur; siparişlerini takip et, favorilerini kaydet ve üyelere özel avantajlardan yararlan.',
  alternates: { canonical: '/uyelik' },
  robots: { index: false, follow: true },
};

const UyelikPage = () => (
  <Suspense fallback={null}>
    <UyelikView />
  </Suspense>
);

export default UyelikPage;
