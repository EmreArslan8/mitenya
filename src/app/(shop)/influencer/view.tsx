'use client';

import { useEffect, useState } from 'react';
import { Box, Chip, Snackbar, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import { Copy, ExternalLink, MoreVertical, Package } from 'lucide-react';
import Button from '@/components/common/Button';
import { fetchProductData } from '@/lib/api/shop';
import type { ShopProductData } from '@/lib/api/types';
import useStyles from './styles';

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
  const styles = useStyles();
  const iconSrc =
    channel === 'instagram'
      ? '/static/images/socials/instagram.svg'
      : channel === 'tiktok'
        ? '/static/images/socials/tiktok.svg'
        : null;

  if (!iconSrc) return null;

  return (
    <Box component="span" sx={styles.channelIconWrap}>
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
    </Box>
  );
};

export default function InfluencerDashboardView() {
  const styles = useStyles();
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
      <Stack alignItems="center" justifyContent="center" minHeight={300}>
        <Typography color="text.secondary">Yükleniyor...</Typography>
      </Stack>
    );
  }

  if (notFound || !data) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={300} gap={1}>
        <Typography variant="h6">Influencer Hesabı Bulunamadı</Typography>
        <Typography color="text.secondary" textAlign="center" maxWidth={400}>
          Bu hesap için influencer kaydı bulunmuyor. Lütfen yönetici ile iletişime geçin.
        </Typography>
      </Stack>
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
    <Stack sx={styles.page}>
      <Stack sx={styles.header}>
        <Stack sx={styles.titleGroup}>
          <Typography sx={styles.title}>Influencer Paneli</Typography>
          <Typography sx={styles.subtitle}>
            Satış linklerini oluştur, paylaş ve performansını tek ekrandan takip et.
          </Typography>
        </Stack>
        <Box sx={styles.profileCard}>
          <Stack sx={styles.profileCardBody}>
            <Stack sx={styles.profileText}>
              <Typography sx={styles.profileName}>{data.affiliate.name}</Typography>
              <Typography sx={styles.profileRole}>Partner</Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      <Box sx={styles.layout}>
        <Stack sx={styles.leftColumn}>
          <Box sx={styles.card}>
            <Stack sx={styles.sectionCardBody}>
              <Typography sx={styles.cardTitle}>Satış Linki Oluştur</Typography>

              <Stack sx={styles.fieldGroup}>
                <Typography variant="overline" sx={styles.fieldLabel}>
                  Platform Seç
                </Typography>
                <Box sx={styles.channelGrid}>
                  {channelOptions.map((option) => {
                    const selected = channel === option.value;
                    return (
                      <Box
                        key={option.value}
                        component="button"
                        type="button"
                        onClick={() => setChannel(option.value)}
                        sx={styles.channelButton(selected)}
                      >
                        <ChannelIcon channel={option.value} />
                        <span>{option.label}</span>
                      </Box>
                    );
                  })}
                </Box>
              </Stack>

              <Stack sx={styles.fieldGroup}>
                <Typography variant="overline" sx={styles.fieldLabel}>
                  İçerik Tipi
                </Typography>
                <Stack sx={styles.contentRow}>
                  {availableContentOptions.map((option) => {
                    const selected = content === option.value;
                    return (
                      <Box
                        key={option.value}
                        component="button"
                        type="button"
                        onClick={() => setContent(option.value)}
                        sx={styles.contentButton(selected)}
                      >
                        {option.label}
                      </Box>
                    );
                  })}
                </Stack>
              </Stack>

              <Box sx={styles.productCard}>
                <Stack sx={styles.productRow}>
                  <Box sx={styles.productImageWrap}>
                    {product?.imgSrc ? (
                      <Box
                        component="img"
                        src={product.imgSrc}
                        alt={product.name || DEFAULT_PRODUCT_NAME}
                        sx={styles.productImage}
                      />
                    ) : (
                      <Package size={26} />
                    )}
                  </Box>
                  <Stack sx={styles.productInfo}>
                    <Typography variant="overline" sx={styles.fieldLabel}>
                      Ürün
                    </Typography>
                    <Typography sx={styles.productName}>{product?.name || DEFAULT_PRODUCT_NAME}</Typography>
                    <Typography sx={styles.productMeta}>
                      30ml • %{(data.affiliate.commissionRate * 100).toFixed(0)} komisyon oranı
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Stack sx={styles.generatedGroup}>
                <Typography variant="overline" sx={styles.fieldLabel}>
                  Oluşturulan Link
                </Typography>
                <Stack sx={styles.generatedWrap}>
                  <Box sx={styles.generatedUrl}>{generatedUrl}</Box>
                  <Stack sx={styles.actionsRow}>
                    <Button
                      variant="contained"
                      onClick={handleCopyGeneratedUrl}
                      startIcon={<Copy size={16} />}
                      sx={styles.copyButton}
                    >
                      Linki Kopyala
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => window.open(generatedUrl, '_blank')}
                      startIcon={<ExternalLink size={16} />}
                      sx={styles.openButton}
                    >
                      Linki Aç
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </Box>

          <Stack sx={styles.recentLinksSection}>
            <Typography sx={styles.recentLinksTitle}>Son Oluşturulan Linkler</Typography>

            {topRecentLinks.map((link, index) => {
              const linkChannel = getChannelFromLink(link);
              const linkContent = getContentFromLink(link);

              return (
                <Box key={`${link}-${index}`} sx={styles.recentLinkCard}>
                  <Stack sx={styles.recentLinkRow}>
                    <Stack sx={styles.recentLinkLeft}>
                      <Box sx={styles.recentLinkIconWrap}>
                        <ChannelIcon channel={linkChannel} />
                      </Box>
                      <Stack sx={styles.recentLinkInfo}>
                        <Typography sx={styles.recentLinkName}>
                          {getChannelLabel(linkChannel)}: {getContentLabel(linkContent)}
                        </Typography>
                        <Typography sx={styles.recentLinkUrl}>{link.replace(/^https?:\/\//, '')}</Typography>
                      </Stack>
                    </Stack>

                    <Stack sx={styles.recentLinkMetaRow}>
                      <Stack sx={styles.recentLinkMeta}>
                        <Typography sx={styles.recentLinkMetaValue}>
                          {index === 0 ? `${filteredClicks.length.toLocaleString('tr-TR')} Tıklama` : 'Kaydedildi'}
                        </Typography>
                        <Typography sx={styles.recentLinkMetaStatus(index === 0)}>
                          {index === 0 ? 'Aktif' : 'Yeni'}
                        </Typography>
                      </Stack>
                      <MoreVertical size={18} />
                    </Stack>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Stack>

        <Stack sx={styles.rightColumn}>
          <Box sx={styles.filterWrap}>
            {dateFilterOptions.map((option) => {
              const selected = dateFilter === option.value;
              return (
                <Box
                  key={option.value}
                  component="button"
                  type="button"
                  onClick={() => setDateFilter(option.value)}
                  sx={styles.filterButton(selected)}
                >
                  {option.label}
                </Box>
              );
            })}
          </Box>

          <Box sx={styles.statsGrid}>
            {stats.map(({ label, value }, index) => {
              const highlighted = index === 3;

              return (
                <Box key={label} sx={styles.statCard(highlighted)}>
                  <Typography sx={styles.statLabel(highlighted)}>{label}</Typography>
                  <Typography sx={styles.statValue}>{value}</Typography>
                  <Typography sx={styles.statHelper(highlighted)}>
                    {highlighted ? '12 gün içinde ödeme' : index === 2 ? 'Ortalama performans' : 'Canlı veri'}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box sx={styles.conversionsCard}>
            <Stack sx={styles.conversionsBody}>
              <Typography sx={styles.conversionsTitle}>Son Dönüşümler</Typography>

              {filteredConversions.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  Henüz dönüşüm bulunmuyor.
                </Typography>
              ) : (
                <Stack sx={styles.conversionList}>
                  {filteredConversions.slice(0, 4).map((conv, index) => (
                    <Box
                      key={conv.id}
                      sx={styles.conversionRowWrap(index === Math.min(filteredConversions.length, 4) - 1)}
                    >
                      <Stack sx={styles.conversionRow}>
                        <Stack sx={styles.conversionInfo}>
                          <Typography sx={styles.conversionOrder}>{conv.order_number}</Typography>
                          <Typography sx={styles.conversionMeta}>
                            {new Date(conv.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            • ₺{Number(conv.order_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Stack>
                        <Stack sx={styles.conversionRight}>
                          <Typography sx={styles.conversionAmount}>
                            +₺{Number(conv.commission_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </Typography>
                          <Chip
                            label={statusLabel[conv.status]}
                            size="small"
                            variant="outlined"
                            sx={styles.conversionChip}
                          />
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Link kopyalandı"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  );
}
