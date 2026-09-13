'use client';

import { ShopOrderListItemData } from '@/lib/api/types';
import Card from '@/components/common/Card';
import InfoItem from '@/components/InfoItem';
import parseDate from '@/lib/utils/parseDate';
import { ChevronRight } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { Chip } from '@/components/ui/Chip';

/**
 * ADR-0002 Faz 1 pilot — GEÇİCİ KARMA DURUM.
 * InfoItem'ın API'si değiştiği için yalnızca ona geçen 5 stil anahtarı
 * Tailwind'e çevrildi; dosyanın geri kalanı hâlâ MUI + styles.ts.
 * TODO(faz-5): bu dosya sipariş sayfalarıyla birlikte tamamen dönüşecek.
 */
const infoItemClass = {
  metaLabel: 'text-[11px] font-bold uppercase tracking-[0.45px] text-text-medium leading-[1.2]',
  orderId: 'text-[16px] sm:text-[17px] font-bold text-text leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap',
  metaValue: 'text-[13px] sm:text-[14px] font-medium text-text-medium-light leading-[1.4]',
  metaValueEllipsis: 'text-[13px] sm:text-[14px] font-medium text-text-medium-light leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap',
  totalValue: 'text-[15px] sm:text-[16px] font-bold text-text leading-[1.3]',
} as const;


const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; indicator: string }
> = {
  processing: {
    label: 'Sipariş Alındı',
    color: '#1754B0',
    bg: '#F5F9FF',
    indicator: '#4A87E3',
  },
  preparing: {
    label: 'Hazırlanıyor',
    color: '#CCA300',
    bg: '#FFFAE3',
    indicator: '#FFC003',
  },
  shipped: {
    label: 'Kargoda',
    color: '#B45309',
    bg: '#FFF7ED',
    indicator: '#F59E0B',
  },
  delivered: {
    label: 'Teslim Edildi',
    color: '#226B3A',
    bg: '#E6F4EC',
    indicator: '#2F8C4B',
  },
  cancelled: {
    label: 'İptal',
    color: '#8B0D14',
    bg: '#FDEBEC',
    indicator: '#C1121F',
  },
};

const OrderListItemCard = ({ data }: { data: ShopOrderListItemData }) => {
  const router = useRouter();
  const config = statusConfig[data.status] ?? statusConfig.processing;
  const orderNo = data.orderId || data.id;
  const totalProductCount = data.totalProductCount || 0;
  const productSummary = data.firstProductName
    ? `${data.firstProductName}${totalProductCount > 1 ? ` +${totalProductCount - 1} ürün` : ''}`
    : 'Ürün detayı yüklenemedi';

  const formattedTotal = typeof data.totalAmount === 'number'
    ? new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: data.currency || 'TRY',
      }).format(data.totalAmount)
    : '-';

  const formattedDate = (() => {
    const d = new Date(data.createdDate);
    if (!Number.isNaN(d.getTime())) {
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(d);
    }
    try {
      return parseDate(data.createdDate);
    } catch {
      return data.createdDate;
    }
  })();

  return (
    <Card
      border
      className="cursor-pointer overflow-hidden rounded-2xl border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_10px_28px_rgba(17,24,39,0.08)] [&:hover_.order-arrow]:translate-x-1 [&:hover_.order-arrow]:text-text"
      onClick={() => router.push(`/orders/${data.id}`)}
    >
      <div className="flex w-full flex-nowrap items-start justify-between gap-2 px-3.5 py-4 sm:gap-3 sm:px-[18px] sm:py-5 lg:items-center lg:gap-3.5 lg:px-5 lg:py-[22px] xl:py-6">
        <span className="w-[5px] self-stretch rounded-r-[3px]" style={{ backgroundColor: config.indicator }} />

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2 lg:grid-cols-[minmax(160px,1.1fr)_minmax(140px,0.95fr)_minmax(180px,1.5fr)_minmax(110px,0.8fr)] lg:gap-[9px]">
          <div className="min-w-0">
            <InfoItem
              label="Sipariş No"
              value={`#${orderNo}`}
              labelClassName={infoItemClass.metaLabel}
              valueClassName={infoItemClass.orderId}
            />
          </div>

          <div className="min-w-0">
            <InfoItem
              label="Sipariş Tarihi"
              value={formattedDate}
              labelClassName={infoItemClass.metaLabel}
              valueClassName={infoItemClass.metaValue}
            />
          </div>

          <div className="min-w-0">
            <InfoItem
              label="Ürünler"
              value={productSummary}
              labelClassName={infoItemClass.metaLabel}
              valueClassName={infoItemClass.metaValueEllipsis}
            />
          </div>

          <div className="min-w-0">
            <InfoItem
              label="Toplam Tutar"
              value={formattedTotal}
              labelClassName={infoItemClass.metaLabel}
              valueClassName={infoItemClass.totalValue}
            />
          </div>
        </div>

        <div className="flex min-w-0 shrink-0 self-stretch items-center justify-end gap-2 lg:min-w-[128px] xl:min-w-[146px]">
          <Chip
            label={config.label}
            size="small"
            className="h-8 min-w-[112px] max-w-[118px] rounded-[10px] text-[11px] font-bold uppercase tracking-[0.25px] sm:min-w-[118px] sm:max-w-[130px] lg:min-w-[126px] lg:max-w-[140px]"
            style={{
              backgroundColor: config.bg,
              color: config.color,
              border: `1px solid ${config.color}20`,
            }}
          />
          <span className="order-arrow hidden size-[34px] shrink-0 items-center justify-center rounded-full bg-[#F7F8FA] text-text-disabled transition-all duration-200 xl:flex">
            <ChevronRight size={18} />
          </span>
        </div>
      </div>
    </Card>
  );
};

export default OrderListItemCard;
