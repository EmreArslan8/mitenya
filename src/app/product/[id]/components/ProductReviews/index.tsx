'use client';

import { useCallback, useMemo, useState } from 'react';
import Button from '@/components/common/Button';
import Banner from '@/components/common/Banner';
import Card from '@/components/common/Card';
import { ShopProductRating, ShopProductReview } from '@/lib/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { usePalette } from '@/theme/ThemeRegistry';
import { Divider, Grid, Rating, Stack, TextField, Typography } from '@mui/material';
import Image from 'next/image';
import useStyles from './styles';

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
  const [myRating, setMyRating] = useState<number>(5);
  const [myText, setMyText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canWrite = isAuthenticated === true;

  const computedRating = useMemo<ShopProductRating | undefined>(() => {
    if (rating) return rating;
    if (!reviews.length) return undefined;
    const avg = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length;
    return { averageRating: Math.round(avg * 100) / 100, totalCount: reviews.length };
  }, [rating, reviews]);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, { method: 'GET' });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const json = await res.json();
      setReviews(json.reviews ?? []);
      setRating(json.rating);
    } catch (e) {
      setError('Yorumlar yüklenemedi. Lütfen tekrar deneyin.');
    }
  }, [productId]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setSuccess(null);

    if (!canWrite) {
      openAuthenticator({
        onSuccess: () => {
          refresh();
        },
      });
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
        body: JSON.stringify({ rating: myRating, text: trimmed }),
      });

      if (res.status === 401) {
        openAuthenticator();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to save review');
      }

      setMyText('');
      setSuccess('Yorumun kaydedildi.');
      await refresh();
    } catch (e) {
      setError('Yorum kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [canWrite, myRating, myText, openAuthenticator, productId, refresh]);

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

  return (
    <Stack gap={1}>
      <Typography variant="h2">Ürün Değerlendirmeleri</Typography>
      <Card
        border
        titleProps={{ textTransform: 'none' }}
        title={
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            gap={2}
            sx={{
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              py: 1,
              px: 2,
              borderRadius: 2,
              backgroundColor: palette.warning.light,
            }}
          >
            <Stack direction="row" gap={1.5} alignItems="center">
              <Rating
                readOnly
                precision={0.1}
                value={computedRating?.averageRating ?? 0}
                sx={{ fontSize: { xs: 22, sm: 26 }, color: palette.warning.main }}
              />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {computedRating?.averageRating ?? 0}
              </Typography>
              <Typography variant="body" sx={{ color: palette.text.medium }}>
                • {computedRating?.totalCount ?? 0} Değerlendirme
              </Typography>
              <Typography variant="body" sx={{ color: palette.text.medium }}>
                • {reviews.length} Yorum
              </Typography>
            </Stack>
          </Stack>
        }
      >
        <Stack sx={{ px: 2, py: 2 }} gap={1.5}>
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
          {success && (
            <Stack
              sx={{
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

          <Stack gap={1}>
            <Typography variant="subtitle2" sx={{ letterSpacing: 0.2 }}>
              {canWrite
                ? `Yorum yaz${customerData?.fullName ? ` (${customerData.fullName})` : ''}`
                : 'Yorum yazmak için giriş yap'}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              gap={1}
              alignItems={{ sm: 'center' }}
            >
              <Stack direction="row" gap={1} alignItems="center">
                <Typography variant="caption">Puan</Typography>
                <Rating
                  value={myRating}
                  onChange={(_, value) => setMyRating(value ?? 5)}
                />
              </Stack>

              <Stack direction="row" gap={1} flex={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ürünle ilgili deneyimini yaz…"
                  value={myText}
                  onChange={(e) => setMyText(e.target.value)}
                  multiline
                  minRows={2}
                  sx={{
                    background: palette.bg.light,
                    borderRadius: 1,
                  }}
                />
              </Stack>

              <Button
                variant="contained"
                loading={loading}
                onClick={handleSubmit}
                sx={{
                  whiteSpace: 'nowrap',
                  borderRadius: '999px',
                  px: 2.5,
                  boxShadow: `0 8px 24px ${palette.accentRed.light}`,
                }}
              >
                Gönder
              </Button>
            </Stack>
          </Stack>
        </Stack>

        {reviews.length ? (
          <Stack sx={{ px: 2, pb: 2 }}>
            <Grid container spacing={2}>
              {reviews.map((e, i) => (
                <Grid item xs={12} md={4} key={(e as any).id ?? `${e.date ?? 'd'}-${i}`}>
                  <Stack
                    sx={{
                      height: '100%',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: palette.white.main,
                      p: 2,
                      gap: 1.5,
                    }}
                  >
                    <Stack sx={styles.review.header}>
                      {e.rating && (
                        <Rating
                          readOnly
                          sx={{ fontSize: 18, color: palette.warning.main }}
                          value={e.rating}
                        />
                      )}
                    </Stack>
                    <Stack direction="row" gap={1} alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {e.name ?? 'Kullanıcı'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: palette.text.light }}>
                        • {formatReviewDate(e.date)}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="body"
                      sx={{
                        color: palette.text.main,
                        display: '-webkit-box',
                        WebkitLineClamp: 5,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {e.text}
                    </Typography>
                    <Stack direction="row" gap={0.5} alignItems="center">
                      <Typography variant="caption" sx={{ color: palette.blue.main, fontWeight: 600 }}>
                        Mitenya
                      </Typography>
                      <Typography variant="caption" sx={{ color: palette.text.light }}>
                        satıcısından alındı
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              ))}
            </Grid>
            {reviews.length > 3 && (
              <Stack alignItems="center" sx={{ pt: 3 }}>
                <Button variant="outlined" sx={{ px: 4, borderRadius: 999 }}>
                  Tüm Yorumları Göster
                </Button>
              </Stack>
            )}
          </Stack>
        ) : (
          <Stack sx={{ px: 2, py: 3, textAlign: 'center', background: palette.bg.light }}>
            <Typography variant="body">Henüz yorum yok.</Typography>
          </Stack>
        )}
      </Card>
    </Stack>
  );
};

export default ProductReviews;
