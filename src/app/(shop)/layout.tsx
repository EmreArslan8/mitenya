import Footer from '@/components/Footer';
import MainLayout from '@/components/layouts/MainLayout';
import Navigation from '@/components/Navigation';
import { fetchShopFooter, fetchShopHeader } from '@/lib/api/cms';
import { Suspense } from 'react';

const ShopLayout = async ({ children }: { children: React.ReactNode }) => {
  const headerData = await fetchShopHeader();
  const footerData = await fetchShopFooter();

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
