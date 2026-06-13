import Footer from '@/components/Footer';
import MainLayout from '@/components/layouts/MainLayout';
import Navigation from '@/components/Navigation';
// ADR-0001: header/footer artık doğrudan Strapi'den (self-fetch yok) → ISR'ı açar.
import { getShopFooterDirect, getShopHeaderDirect } from '@/lib/api/cmsDirect';
import { Suspense } from 'react';

const ShopLayout = async ({ children }: { children: React.ReactNode }) => {
  const headerData = await getShopHeaderDirect();
  const footerData = await getShopFooterDirect();

  return (
    <>
      <Suspense fallback={<div style={{ height: '100px' }} />}>
        <Navigation data={headerData} />
      </Suspense>

      <MainLayout>{children}</MainLayout>

      <Footer data={footerData} />
    </>
  );
};

export default ShopLayout;
