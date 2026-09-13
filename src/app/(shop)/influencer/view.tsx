'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MoreVertical } from '@/components/icons';
import { Copy, ExternalLink, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchProductData } from '@/lib/api/shop';
import type { ShopProductData } from '@/lib/api/types';
import { Chip } from '@/components/ui/Chip';
import { Toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils/cn';

interface AffiliateConversion {
  id: string;
  order_number: string;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  created_at: string;
}

interface DashboardData {
  affiliate: {
    code: string;
    name: string;
    commissionRate: number;
  };
  stats: {
    totalClicks: number;
    totalSales: number;
    approvedCommission: number;
    pendingCommission: number;
  };
  clickEvents: {
    id: string;
    created_at: string;
    converted: boolean;
  }[];
  conversions: AffiliateConversion[];
}

type DateFilter = 'all' | '7d' | '30d' | 'today';

const statusLabel: Record<AffiliateConversion['status'], string> = {
  pending: 'Bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  paid: 'Ödendi',
};

const channelOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
];

const contentOptions = [
  { value: 'instagram_story', label: 'Story' },
  { value: 'instagram_reels', label: 'Reels' },
  { value: 'instagram_post', label: 'Post' },
  { value: 'tiktok_video', label: 'Video' },
];

const channelContentMap: Record<string, string[]> = {
  instagram: ['instagram_story', 'instagram_reels', 'instagram_post'],
  tiktok: ['tiktok_video'],
};

const DEFAULT_PRODUCT_SLUG = 'celimax-retinol-shot-tightening-serum-30ml';
const DEFAULT_PRODUCT_NAME = 'Celimax Retinol Shot Tightening Serum 30ml';
const RECENT_LINKS_STORAGE_KEY = 'mitenya_recent_influencer_links';
const dateFilterOptions: Array<{ value: DateFilter; label: string }> = [
  { value: 'today', label: 'Bugün' },
  { value: '7d', label: '7 Gün' },
  { value: '30d', label: '30 Gün' },
  { value: 'all', label: 'Tümü' },
];

const isWithinDateFilter = (dateString: string, filter: DateFilter) => {
  if (filter === 'all') return true;

  const date = new Date(dateString);
  if (!Number.isFinite(date.getTime())) return false;

  const now = new Date();
  if (filter === 'today') return date.toDateString() === now.toDateString();

  const days = filter === '7d' ? 7 : 30;
  const threshold = new Date();
  threshold.setDate(now.getDate() - days);
  threshold.setHours(0, 0, 0, 0);

  return date >= threshold;
};

const getChannelLabel = (value: string) =>
  channelOptions.find((option) => option.value === value)?.label ?? value;

const getContentLabel = (value: string) =>
  contentOptions.find((option) => option.value === value)?.label ?? value;

const getChannelFromLink = (link: string) => (link.includes('utm_source=tiktok') ? 'tiktok' : 'instagram');

const getContentFromLink = (link: string) => {
  if (link.includes('utm_content=tiktok_video')) return 'tiktok_video';
  if (link.includes('utm_content=instagram_reels')) return 'instagram_reels';
  if (link.includes('utm_content=instagram_post')) return 'instagram_post';
  return 'instagram_story';
};

const ChannelIcon = ({ channel }: { channel: string }) => {
  const iconSrc =
    channel === 'instagram'
      ? '/static/images/socials/instagram.svg'
      : channel === 'tiktok'
        ? '/static/images/socials/tiktok.svg'
        : null;

  if (!iconSrc) return null;

  return (
    <span className="inline-flex size-[22px] shrink-0 items-center justify-center rounded-full border border-black/10 bg-white">
      <Image
        src={iconSrc}
        alt={getChannelLabel(channel)}
        width={24}
        height={24}
        style={{
          width: 24,
          height: 24,
          objectFit: 'contain',
          filter: channel === 'instagram' ? 'brightness(0) saturate(100%)' : 'none',
        }}
      />
    </span>
  );
};

export default function InfluencerDashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [channel, setChannel] = useState('instagram');
  const [content, setContent] = useState('instagram_story');
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [recentLinks, setRecentLinks] = useState<string[]>([]);
  const [product, setProduct] = useState<ShopProductData | null>(null);
  const defaultProductPath = `/product/${DEFAULT_PRODUCT_SLUG}`;
  const availableContentOptions = contentOptions.filter((option) =>
    (channelContentMap[channel] ?? []).includes(option.value)
  );

  const generatedUrl =
    typeof window !== 'undefined' && data
      ? `${window.location.origin}${defaultProductPath}?ref=${encodeURIComponent(
          data.affiliate.code
        )}&utm_source=${encodeURIComponent(channel)}&utm_medium=influencer&utm_content=${encodeURIComponent(
          content
        )}`
      : '';

  const handleCopyGeneratedUrl = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setRecentLinks((prev) => {
      const next = [generatedUrl, ...prev.filter((item) => item !== generatedUrl)].slice(0, 5);
      window.localStorage.setItem(RECENT_LINKS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setCopied(true);
  };

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const response = await fetch('/api/affiliates/dashboard', { cache: 'no-store' });

        if (!active) return;
        if (response.status === 401) {
          window.location.href = '/?login=true';
          return;
        }
        if (response.status === 404) {
          setNotFound(true);
          setData(null);
          return;
        }
        if (!response.ok) throw new Error('Dashboard fetch failed');

        const payload = (await response.json()) as DashboardData;
        if (!active) return;

        setData(payload);
        setNotFound(false);
      } catch {
        if (!active) return;
        setNotFound(true);
        setData(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const allowedContentValues = channelContentMap[channel] ?? [];
    if (allowedContentValues.includes(content)) return;
    setContent(allowedContentValues[0]);
  }, [channel, content]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(RECENT_LINKS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed)) {
        setRecentLinks(parsed.filter((item) => typeof item === 'string').slice(0, 5));
      }
    } catch {
      // ignore localStorage parse issues
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      const payload = await fetchProductData(DEFAULT_PRODUCT_SLUG);
      if (!active || !payload) return;
      setProduct(payload);
    };

    void loadProduct();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-text-secondary">Yükleniyor...</div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2">
        <h1 className="text-xl font-semibold">Influencer Hesabı Bulunamadı</h1>
        <p className="max-w-[400px] text-center text-text-secondary">
          Bu hesap için influencer kaydı bulunmuyor. Lütfen yönetici ile iletişime geçin.
        </p>
      </div>
    );
  }

  const filteredClicks = data.clickEvents.filter((click) => isWithinDateFilter(click.created_at, dateFilter));
  const filteredConversions = data.conversions.filter((conversion) =>
    isWithinDateFilter(conversion.created_at, dateFilter)
  );
  const filteredPendingCommission = filteredConversions
    .filter((conversion) => conversion.status === 'pending')
    .reduce((sum, conversion) => sum + Number(conversion.commission_amount), 0);
  const conversionRate = filteredClicks.length
    ? ((filteredConversions.length / filteredClicks.length) * 100).toFixed(1)
    : '0.0';
  const topRecentLinks = (recentLinks.length > 0 ? recentLinks : [generatedUrl]).slice(0, 2);

  const stats = [
    { label: 'Toplam Tıklama', value: filteredClicks.length.toLocaleString('tr-TR') },
    { label: 'Toplam Satış', value: filteredConversions.length.toLocaleString('tr-TR') },
    { label: 'Dönüşüm Oranı', value: `%${conversionRate}` },
    {
      label: 'Bekleyen',
      value: `₺${filteredPendingCommission.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
    },
  ];

  return (
    <main className="flex flex-1 flex-col gap-5 py-4 md:py-6">
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-[2rem] font-medium leading-[1.03] tracking-[-0.05em] md:text-[2.6rem]">Influencer Paneli</h1>
          <p className="text-[15px] leading-normal text-text-medium-light md:text-base">Satış linklerini oluştur, paylaş ve performansını tek ekrandan takip et.</p>
        </div>
        <div className="w-full md:min-w-[220px] md:w-auto">
          <div className="flex flex-col items-start gap-[3px] md:items-end md:text-right">
            <p className="text-lg font-bold leading-tight text-text md:text-[22px]">{data.affiliate.name}</p>
            <p className="text-[15px] leading-tight text-text-medium-light md:text-[17px]">Partner</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <div className="flex flex-col gap-4">
          <section className="rounded-[32px] border border-gray-100 bg-bg p-4 md:p-5">
            <div className="flex flex-col gap-[18px]">
              <h2 className="text-[1.65rem] font-medium tracking-[-0.04em] md:text-[1.8rem]">Satış Linki Oluştur</h2>

              <div className="flex flex-col gap-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-light">Platform Seç</p>
                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                  {channelOptions.map((option) => {
                    const selected = channel === option.value;
                    return (
                      <button key={option.value} type="button" onClick={() => setChannel(option.value)} className={cn('flex h-[60px] items-center justify-center gap-2.5 rounded-[10px] border text-[15px] font-medium transition hover:border-primary hover:text-primary md:text-base', selected ? 'border-2 border-primary font-bold text-primary' : 'border-gray-100 text-text-medium-light')}>
                        <ChannelIcon channel={option.value} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-light">İçerik Tipi</p>
                <div className="flex flex-wrap gap-2.5">
                  {availableContentOptions.map((option) => {
                    const selected = content === option.value;
                    return (
                      <button key={option.value} type="button" onClick={() => setContent(option.value)} className={cn('min-w-[98px] rounded-full border px-[18px] py-2 text-sm font-medium transition hover:border-primary', selected ? 'border-primary bg-primary text-primary-contrast-text' : 'border-gray-100 bg-bg text-text-medium-light hover:text-primary')}>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 p-3.5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="grid size-[88px] shrink-0 place-items-center overflow-hidden rounded-[10px]">
                    {product?.imgSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imgSrc} alt={product.name || DEFAULT_PRODUCT_NAME} className="block size-full object-cover" />
                    ) : <Package size={26} />}
                  </div>
                  <div className="flex flex-col gap-[5px]">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-light">Ürün</p>
                    <p className="max-w-[380px] text-xl font-medium leading-tight md:text-[17px]">{product?.name || DEFAULT_PRODUCT_NAME}</p>
                    <p className="text-sm text-text-medium-light">30ml • %{(data.affiliate.commissionRate * 100).toFixed(0)} komisyon oranı</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-[9px]">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-text-light">Oluşturulan Link</p>
                <div className="flex flex-col gap-2.5">
                  <div className="min-h-[88px] w-full select-text break-all rounded-[9px] border border-gray-100 px-4 py-3 font-mono text-sm leading-relaxed text-text md:text-[15px]">{generatedUrl}</div>
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <Button variant="contained" onClick={handleCopyGeneratedUrl} startIcon={<Copy size={16} />} className="h-[52px] min-w-full rounded-[9px] bg-primary sm:min-w-[168px]">Linki Kopyala</Button>
                    <Button variant="outlined" onClick={() => window.open(generatedUrl, '_blank')} startIcon={<ExternalLink size={16} />} className="h-[52px] min-w-full rounded-[9px] border-gray-100 bg-bg text-text-medium sm:min-w-[132px]">Linki Aç</Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-[9px]">
            <h2 className="text-[1.55rem] font-medium tracking-[-0.04em] md:text-[1.75rem]">Son Oluşturulan Linkler</h2>
            {topRecentLinks.map((link, index) => {
              const linkChannel = getChannelFromLink(link);
              const linkContent = getContentFromLink(link);
              return (
                <article key={`${link}-${index}`} className="rounded-3xl border border-gray-100 bg-bg p-3.5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span className="grid size-[54px] shrink-0 place-items-center rounded-lg"><ChannelIcon channel={linkChannel} /></span>
                      <div className="min-w-0">
                        <p className="text-[15.5px] font-medium">{getChannelLabel(linkChannel)}: {getContentLabel(linkContent)}</p>
                        <p className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[13px] text-text-medium-light sm:max-w-[300px] md:max-w-[420px]">{link.replace(/^https?:\/\//, '')}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2.5">
                      <div className="flex flex-col items-end">
                        <span className="text-[15px] font-medium">{index === 0 ? `${filteredClicks.length.toLocaleString('tr-TR')} Tıklama` : 'Kaydedildi'}</span>
                        <span className={cn('text-[13px]', index === 0 ? 'text-success' : 'text-text-light')}>{index === 0 ? 'Aktif' : 'Yeni'}</span>
                      </div>
                      <MoreVertical size={18} />
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-4 gap-1 rounded-[10px] border border-gray-100 bg-bg p-[4px]">
            {dateFilterOptions.map((option) => {
              const selected = dateFilter === option.value;
              return <button key={option.value} type="button" onClick={() => setDateFilter(option.value)} className={cn('rounded-[7px] px-2 py-[9px] text-[13px] font-medium', selected ? 'bg-primary text-primary-contrast-text' : 'bg-transparent text-text-medium-light')}>{option.label}</button>;
            })}
          </div>

          <div className="grid grid-cols-2 gap-[9px]">
            {stats.map(({ label, value }, index) => {
              const highlighted = index === 3;
              return (
                <div key={label} className={cn('min-h-[104px] rounded-3xl border p-3.5', highlighted ? 'border-primary bg-primary text-primary-contrast-text' : 'border-gray-100 text-text')}>
                  <p className={cn('mb-[11px] text-xs uppercase tracking-[0.1em]', highlighted ? 'text-white/80' : 'text-text-light')}>{label}</p>
                  <p className="text-[22px] font-medium tracking-[-0.04em] md:text-2xl">{value}</p>
                  <p className={cn('mt-[7px] text-[13px]', highlighted ? 'text-white/80' : 'text-text-light')}>{highlighted ? '12 gün içinde ödeme' : index === 2 ? 'Ortalama performans' : 'Canlı veri'}</p>
                </div>
              );
            })}
          </div>

          <section className="rounded-[32px] border border-gray-100 bg-bg p-4 md:p-[17px]">
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-extrabold uppercase tracking-[0.12em] text-text-light">Son Dönüşümler</h2>
              {filteredConversions.length === 0 ? <p className="text-sm text-text-secondary">Henüz dönüşüm bulunmuyor.</p> : (
                <div>
                  {filteredConversions.slice(0, 4).map((conv, index) => (
                    <div key={conv.id} className={cn('py-[9px]', index !== Math.min(filteredConversions.length, 4) - 1 && 'border-b border-gray-100')}>
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="text-[17px] font-medium">{conv.order_number}</p><p className="text-[13px] text-text-medium-light">{new Date(conv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • ₺{Number(conv.order_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p></div>
                        <div className="flex flex-col items-end gap-[3px]"><p className="text-[15px] font-bold text-primary">+₺{Number(conv.commission_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p><Chip label={statusLabel[conv.status]} size="small" variant="outlined" className="border-gray-100 bg-bg font-semibold text-text-medium-light" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <Toast open={copied} duration={2000} onClose={() => setCopied(false)} position="bottom-center">
        <div className="rounded bg-gray-800 px-4 py-3 text-[14px] text-white shadow-lg">Link kopyalandı</div>
      </Toast>
    </main>
  );
}
