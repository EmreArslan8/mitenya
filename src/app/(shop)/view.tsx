import BlockManager from "@/components/cms/blocks";
import WelcomeCouponModal from '@/components/WelcomeCouponModal';
import { CMSPageData } from "@/lib/api/cms";
import { ShopCoupon } from '@/lib/api/types';

const gapValues = {
  small: 'gap-6 sm:gap-10',
  medium: 'gap-10 sm:gap-16',
  large: 'gap-16 sm:gap-24',
} as const;

const HomePageView = ({ data, coupons = [] }: { data?: CMSPageData; coupons?: ShopCoupon[] }) => {
  if (!data) {
    console.warn("⚠️ [HomePageView] data yok!");
    return <p style={{ color: "red" }}>Veri bulunamadı (data undefined)</p>;
  }

  return (
    <div className={`flex flex-col ${gapValues[data?.gap ?? "medium"]}`}>
      <WelcomeCouponModal coupons={coupons} placement="home" />
      <h1 className="sr-only">
        Kore Kozmetik ve Cilt Bakım Ürünleri - Mitenya
      </h1>
      {data?.blocks && <BlockManager blocks={data.blocks} />}
    </div>
  );
};

export default HomePageView;
