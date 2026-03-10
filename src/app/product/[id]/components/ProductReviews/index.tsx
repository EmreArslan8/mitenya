'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import { ShopProductRating, ShopProductReview } from '@/lib/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { usePalette } from '@/theme/ThemeRegistry';
import {
  Box,
  Divider,
  FormControl,
  LinearProgress,
  MenuItem,
  Rating,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CheckCircle2, Pencil } from 'lucide-react';
import useStyles from './styles';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'oldest', label: 'En Eski' },
  { value: 'highest', label: 'En Yüksek Puan' },
  { value: 'lowest', label: 'En Düşük Puan' },
];

const ProductReviews = ({
  productId,
  initialReviews,
  initialRating,
}: {
  productId: string;
  initialReviews: ShopProductReview[];
  initialRating?: ShopProductRating;
}) => {
  const styles = useStyles();
  const palette = usePalette();
  const { isAuthenticated, openAuthenticator, customerData } = useAuth();

  const [reviews, setReviews] = useState<ShopProductReview[]>(initialReviews);
  const [rating, setRating] = useState<ShopProductRating | undefined>(initialRating);
  const [showForm, setShowForm] = useState(false);
  const [myRating, setMyRating] = useState<number>(0);
  const [myTitle, setMyTitle] = useState('');
  const [myText, setMyText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const eligibilityCache = useRef<{ eligible: boolean; reason?: string } | null>(null);

  const canWrite = isAuthenticated === true;

  const getEligibilityMessage = (reason?: string) =>
    reason === 'already_reviewed'
      ? 'Bu ürün için zaten bir yorum yazmışsınız.'
      : 'Bu ürüne yorum yazabilmek için önce satın almış ve teslim almış olmanız gerekmektedir.';

  const computedRating = useMemo<ShopProductRating | undefined>(() => {
    if (rating) return rating;
    if (!reviews.length) return undefined;
    const avg = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length;
    return { averageRating: Math.round(avg * 100) / 100, totalCount: reviews.length };
  }, [rating, reviews]);

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      if (r.rating && r.rating >= 1 && r.rating <= 5) {
        dist[r.rating - 1]++;
      }
    });
    return dist;
  }, [reviews]);

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.date ?? '').getTime() - new Date(a.date ?? '').getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.date ?? '').getTime() - new Date(b.date ?? '').getTime());
      case 'highest':
        return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case 'lowest':
        return sorted.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
      default:
        return sorted;
    }
  }, [reviews, sortBy]);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, { method: 'GET' });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const json = await res.json();
      setReviews(json.reviews ?? []);
      setRating(json.rating);
    } catch {
      setError('Yorumlar yüklenemedi. Lütfen tekrar deneyin.');
    }
  }, [productId]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (myRating === 0) {
      setError('Lütfen bir puan verin.');
      return;
    }

    const trimmed = myText.trim();
    if (trimmed.length < 5) {
      setError('Yorum en az 5 karakter olmalı.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: myRating, title: myTitle.trim(), text: trimmed }),
      });

      if (res.status === 401) {
        openAuthenticator();
        return;
      }

      if (res.status === 403) {
        const data = await res.json();
        setError(data.error || 'Bu ürüne yorum yazma yetkiniz bulunmuyor.');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to save review');
      }

      setMyText('');
      setMyTitle('');
      setMyRating(0);
      setShowForm(false);
      setSuccess('Yorumunuz başarıyla kaydedildi!');
      eligibilityCache.current = { eligible: false, reason: 'already_reviewed' };
      await refresh();
    } catch {
      setError('Yorum kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [myRating, myTitle, myText, productId, refresh, openAuthenticator]);

  const formatReviewDate = (value?: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    try {
      return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(parsed);
    } catch {
      return '';
    }
  };

  const getInitial = (name?: string) => {
    if (!name) return 'K';
    return name.charAt(0).toUpperCase();
  };

  const totalReviews = computedRating?.totalCount ?? reviews.length;
  const hasReviews = totalReviews > 0;

  const openReviewForm = async () => {
    if (!canWrite) {
      openAuthenticator({
        onSuccess: () => {
          refresh();
        },
      });
      return;
    }

    // Use cached result if available
    if (eligibilityCache.current) {
      if (!eligibilityCache.current.eligible) {
        setError(getEligibilityMessage(eligibilityCache.current.reason));
        return;
      }
      setError(null);
      setShowForm(true);
      return;
    }

    // Fetch eligibility on first click
    setEligibilityLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/reviews/eligibility`);
      const data = await res.json();
      eligibilityCache.current = { eligible: data.eligible ?? false, reason: data.reason };

      if (!data.eligible) {
        setError(getEligibilityMessage(data.reason));
        return;
      }
      setShowForm(true);
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setEligibilityLoading(false);
    }
  };

  return (
    <Stack
      gap={3}
      sx={{
        px: { xs: '16px', sm: '32px' },
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: 500,
          fontSize: { xs: 24, sm: 36 },
          lineHeight: { xs: '28px', sm: '40px' },
        }}
      >
        Müşteri Yorumları
      </Typography>

      <Card border>
        {hasReviews && (
          <>
            {/* Rating Summary Header */}
            <Stack sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }, pb: 2 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                gap={{ xs: 2, sm: 4 }}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
              >
                {/* Left: Overall Rating */}
                <Stack direction="row" gap={2} alignItems="center">
                  <Rating
                    readOnly
                    precision={0.1}
                    value={computedRating?.averageRating ?? 0}
                    sx={{ fontSize: { xs: 24, sm: 28 }, color: palette.warning.main }}
                  />
                  <Typography variant="body" sx={{ color: palette.text.medium, whiteSpace: 'nowrap' }}>
                    {totalReviews} değerlendirmeye dayalı
                  </Typography>
                </Stack>

                {/* Right: Write Review Button */}
                <Button
                  variant={showForm ? 'text' : 'outlined'}
                  disabled={!showForm && eligibilityLoading}
                  loading={!showForm && eligibilityLoading}
                  onClick={() => {
                    if (showForm) {
                      setShowForm(false);
                    } else {
                      openReviewForm();
                    }
                  }}
                  sx={{
                    whiteSpace: 'nowrap',
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    borderColor: palette.gray[200],
                    color: palette.text.main,
                    '&:hover': {
                      borderColor: palette.gray[400],
                      backgroundColor: palette.bg.light,
                    },
                  }}
                >
                  {showForm ? 'Vazgeç' : 'Yorum Yaz'}
                </Button>
              </Stack>

              {/* Rating Breakdown Bars */}
              <Stack sx={{ mt: 2, maxWidth: 340 }} gap={0.3}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star - 1];
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <Stack key={star} direction="row" alignItems="center" gap={1}>
                      <Rating
                        readOnly
                        value={star}
                        max={5}
                        sx={{ fontSize: 14, color: palette.warning.main }}
                      />
                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          flex: 1,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: palette.gray[100],
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: palette.warning.main,
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: palette.text.medium, minWidth: 28, textAlign: 'right', fontSize: 12 }}
                      >
                        {Math.round(pct)}%
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: palette.text.light, minWidth: 22, textAlign: 'right', fontSize: 12 }}
                      >
                        ({count})
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Stack>
            <Divider />
          </>
        )}

        {/* Eligibility error (shown once on click, outside form) */}
        {!showForm && error && (
          <Stack
            sx={{
              mx: { xs: 2, sm: 3 },
              mt: 2,
              px: 2,
              py: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: palette.error.main,
              backgroundColor: palette.error.light,
            }}
          >
            <Typography variant="caption" sx={{ color: palette.error.main, fontWeight: 600 }}>
              {error}
            </Typography>
          </Stack>
        )}

        {/* Review Form (toggle) */}
        {showForm && (
          <>
            <Stack sx={{ px: { xs: 2, sm: 3 }, py: 3 }} gap={2.5}>
              {!hasReviews && (
                <Stack direction="row" justifyContent="flex-end">
                  <Button variant="text" onClick={() => setShowForm(false)} sx={{ color: palette.text.medium }}>
                    Vazgeç
                  </Button>
                </Stack>
              )}
              {error && (
                <Stack
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: palette.error.main,
                    backgroundColor: palette.error.light,
                  }}
                >
                  <Typography variant="caption" sx={{ color: palette.error.main, fontWeight: 600 }}>
                    {error}
                  </Typography>
                </Stack>
              )}

              {/* Display Name */}
              <Stack gap={0.5}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Görünen Ad
                  </Typography>
                  <Typography variant="caption" sx={{ color: palette.text.light }}>
                    (herkese açık olarak görüntülenir: {customerData?.fullName ?? 'Kullanıcı'})
                  </Typography>
                </Stack>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Görünen adınız"
                  value={customerData?.fullName ?? ''}
                  disabled
                  sx={{
                    backgroundColor: palette.bg.light,
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              </Stack>

              {/* Rating */}
              <Stack gap={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Puan
                </Typography>
                <Rating
                  value={myRating}
                  onChange={(_, value) => setMyRating(value ?? 0)}
                  sx={{ fontSize: 28, color: palette.warning.main }}
                />
              </Stack>

              {/* Review Title */}
              <Stack gap={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Yorum Başlığı
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Yorumunuza bir başlık verin"
                  value={myTitle}
                  onChange={(e) => setMyTitle(e.target.value)}
                  sx={{
                    backgroundColor: palette.bg.light,
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              </Stack>

              {/* Review Content */}
              <Stack gap={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Yorum İçeriği
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ürünle ilgili deneyiminizi yazın..."
                  value={myText}
                  onChange={(e) => setMyText(e.target.value)}
                  multiline
                  minRows={4}
                  sx={{
                    backgroundColor: palette.bg.light,
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              </Stack>

              <Typography variant="caption" sx={{ color: palette.text.light }}>
                Verilerinizi nasıl kullandığımız: Bıraktığınız yorum hakkında yalnızca gerektiğinde sizinle
                iletişime geçeceğiz. Yorumunuzu göndererek şartlarımızı, gizlilik ve içerik politikalarımızı
                kabul etmiş olursunuz.
              </Typography>

              <Button
                variant="contained"
                loading={loading}
                onClick={handleSubmit}
                sx={{
                  alignSelf: 'flex-start',
                  borderRadius: '8px',
                  px: 4,
                  py: 1.2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: 15,
                }}
              >
                Yorumu Gönder
              </Button>
            </Stack>
            <Divider />
          </>
        )}

        {/* Success Message */}
        {success && (
          <Stack
            sx={{
              mx: { xs: 2, sm: 3 },
              mt: 2,
              px: 2,
              py: 1,
              borderRadius: 1,
              border: '1px solid',
              borderColor: palette.success.main,
              backgroundColor: palette.success.light,
            }}
          >
            <Typography variant="caption" sx={{ color: palette.success.main, fontWeight: 600 }}>
              {success}
            </Typography>
          </Stack>
        )}

        {/* Sort Dropdown */}
        {reviews.length > 0 && (
          <Stack sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
            <FormControl size="small" sx={{ maxWidth: 180 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                sx={{
                  borderRadius: '8px',
                  fontSize: 14,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: palette.gray[200],
                  },
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        )}

        {/* Reviews List */}
        {sortedReviews.length > 0 ? (
          <Stack sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
            {sortedReviews.map((review, i) => (
              <Stack key={review.id ?? `${review.date ?? 'd'}-${i}`}>
                <Divider sx={{ my: 2 }} />
                <Stack gap={1}>
                  {/* Rating + Date */}
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    {review.rating && (
                      <Rating
                        readOnly
                        value={review.rating}
                        sx={{ fontSize: 18, color: palette.warning.main }}
                      />
                    )}
                    <Typography variant="caption" sx={{ color: palette.text.light }}>
                      {formatReviewDate(review.date)}
                    </Typography>
                  </Stack>

                  {/* Avatar + Name + Verified */}
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: palette.gray[100],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: palette.text.medium }}
                      >
                        {getInitial(review.name)}
                      </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" gap={0.5}>
                      {review.verified === true && (
                        <Stack
                          direction="row"
                          alignItems="center"
                          gap={0.3}
                          sx={{
                            backgroundColor: palette.success.light,
                            borderRadius: '4px',
                            px: 0.8,
                            py: 0.2,
                          }}
                        >
                          <CheckCircle2 size={12} color={palette.success.main} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: palette.success.main,
                              fontWeight: 600,
                              fontSize: 11,
                            }}
                          >
                            Doğrulanmış
                          </Typography>
                        </Stack>
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {review.name ?? 'Kullanıcı'}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Review Title */}
                  {review.title && (
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {review.title}
                    </Typography>
                  )}

                  {/* Review Text */}
                  <Typography variant="body" sx={{ color: palette.text.main, lineHeight: 1.6 }}>
                    {review.text}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : (
          !showForm && (
            <Stack sx={styles.emptyState}>
              <Typography sx={styles.emptyStateTitle}>
                Henüz yorum yok, ilk yorumu şimdi yazmak ister misiniz?
              </Typography>
              <Button
                variant="contained"
                disabled={eligibilityLoading}
                loading={eligibilityLoading}
                onClick={openReviewForm}
                sx={styles.emptyStateButton}
                size="small"
              >
                <Stack direction="row" alignItems="center" gap={1}>
                  <Pencil size={16} />
                  Yorum Yaz
                </Stack>
              </Button>
            </Stack>
          )
        )}
      </Card>
    </Stack>
  );
};

export default ProductReviews;
