'use client';

import OrderListItemCard from '@/components/orders/OrderListItemCard';
import { Button } from '@/components/ui/Button';
import { PagedResults, ShopOrderListItemData, ShopOrderStatus } from '@/lib/api/types';
import { UserReview } from '@/lib/api/supabaseReviews';
import { Package, ShoppingBag, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils/cn';

type OrderFilter = 'all' | ShopOrderStatus;

const FILTERS: { key: OrderFilter; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'processing', label: 'Sipariş Alındı' },
  { key: 'preparing', label: 'Hazırlanıyor' },
  { key: 'shipped', label: 'Kargoda' },
  { key: 'delivered', label: 'Teslim Edildi' },
  { key: 'cancelled', label: 'İptal' },
];

type OrdersPageViewProps = {
  data: PagedResults<ShopOrderListItemData>;
  section: 'orders' | 'reviews';
  reviews: UserReview[];
};

const OrdersPageView = ({ data, section, reviews }: OrdersPageViewProps) => {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>('all');
  const total = data.totalRecordCount ?? 0;
  const statusCounts = useMemo(
    () =>
      data.results.reduce<Record<ShopOrderStatus, number>>(
        (acc, order) => {
          acc[order.status] += 1;
          return acc;
        },
        { processing: 0, preparing: 0, shipped: 0, delivered: 0, cancelled: 0 }
      ),
    [data.results]
  );

  const filteredOrders = useMemo(
    () => data.results.filter((order) => activeFilter === 'all' || order.status === activeFilter),
    [activeFilter, data.results]
  );
  const isFilterEmpty = total > 0 && filteredOrders.length === 0;

  if (section === 'reviews') {
    return (
      <div className="flex w-full flex-col gap-8">
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.3px] sm:text-[26px]">
              Değerlendirmelerim
            </h1>
            {reviews.length > 0 && <span className="rounded bg-text px-2 py-0.5 text-[11px] font-extrabold leading-normal tracking-[0.5px] text-white">{reviews.length}</span>}
          </div>
          <p className="max-w-[480px] text-[15px] font-medium leading-normal text-text-medium-light">
            Ürünlere yazdığınız değerlendirmeler burada listelenir.
          </p>
        </header>

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-gray-200 bg-bg-light py-12 text-center sm:py-20">
            <div className="grid size-20 place-items-center rounded-[20px] bg-[linear-gradient(135deg,#F5F5F7_0%,#E5E5EA_100%)]">
              <Star size={32} strokeWidth={1.5} color="#8E8E93" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-lg font-bold tracking-[-0.2px] text-text sm:text-xl">Henüz değerlendirme yok</h2>
              <p className="max-w-[400px] text-[15px] font-medium leading-relaxed text-text-medium-light">
                Teslim aldığınız ürünler için değerlendirme yazabilirsiniz.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="flex flex-col gap-2 rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {review.productName}
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < review.rating ? '#F59E0B' : 'none'}
                        color={i < review.rating ? '#F59E0B' : '#D1D5DB'}
                      />
                    ))}
                  </div>
                </div>
                {review.title && (
                  <p className="text-[13px] font-medium">
                    {review.title}
                  </p>
                )}
                <p className="text-[13px] text-text-secondary">
                  {review.text}
                </p>
                <time className="text-[11px] text-text-disabled">
                  {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                </time>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.3px] sm:text-[26px]">
            Siparişlerim
          </h1>
          {total > 0 && <span className="rounded bg-text px-2 py-0.5 text-[11px] font-extrabold leading-normal tracking-[0.5px] text-white">{total}</span>}
        </div>
        <p className="max-w-[480px] text-[15px] font-medium leading-normal text-text-medium-light">
          Siparişlerinizi takip edin, detaylarını görüntüleyin.
        </p>
      </header>

      {/* Filters */}
      {total > 0 && (
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter.key;
            const count = filter.key === 'all' ? total : statusCounts[filter.key];

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={cn('flex shrink-0 select-none items-center gap-2 whitespace-nowrap rounded-[10px] border px-3 py-2 transition', isActive ? 'border-text bg-text text-white' : 'border-gray-200 bg-white text-text-medium hover:border-text hover:text-text')}
              >
                <span className="text-[13px] font-bold leading-none">{filter.label}</span>
                <span className={cn('grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-extrabold leading-none', isActive ? 'bg-white/20 text-white' : 'bg-bg-dark text-text')}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Order List */}
      {total ? (
        isFilterEmpty ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-gray-200 bg-bg-light py-8 text-center sm:py-10">
            <p className="text-base font-bold text-text">
              Bu filtrede sipariş bulunmuyor
            </p>
            <p className="text-sm font-medium text-text-medium-light">
              Farklı bir filtre seçerek diğer siparişleri görüntüleyin.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredOrders.map((e) => (
              <OrderListItemCard data={e} key={e.id} />
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-gray-200 bg-bg-light py-12 text-center sm:py-20">
          <div className="grid size-20 place-items-center rounded-[20px] bg-[linear-gradient(135deg,#F5F5F7_0%,#E5E5EA_100%)]">
            <Package size={32} strokeWidth={1.5} color="#8E8E93" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <h2 className="text-lg font-bold tracking-[-0.2px] text-text sm:text-xl">
              Henüz siparişiniz yok
            </h2>
            <p className="max-w-[400px] text-[15px] font-medium leading-relaxed text-text-medium-light">
              Siparişleriniz burada listelenecektir. Hemen alışverişe başlayın!
            </p>
          </div>

          <Button
            variant="contained"
            href="/"
            startIcon={<ShoppingBag size={18} />}
          >
            Alışverişe Başla
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrdersPageView;
