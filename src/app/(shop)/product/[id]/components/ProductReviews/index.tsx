'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/common/Card';
import { ShopProductRating, ShopProductReview } from '@/lib/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2 } from '@/components/icons';
import { Pencil } from 'lucide-react';
import { Rating } from '@/components/ui/Rating';
import { Select, SelectItem } from '@/components/ui/Select';
import { RatingInput } from '@/components/ui/Rating/RatingInput';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';

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
      openAuthenticator();
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
    <section className="flex flex-col gap-6 px-4 sm:px-8">
      <h2 className="text-2xl leading-7 font-medium sm:text-4xl sm:leading-10">
        Müşteri Yorumları
      </h2>

      <Card border>
        {hasReviews && (
          <>
            {/* Rating Summary Header */}
            <div className="px-4 pt-4 pb-4 sm:px-6 sm:pt-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center sm:gap-8">
                {/* Left: Overall Rating */}
                <div className="flex items-center gap-4">
                  <Rating
                    value={computedRating?.averageRating ?? 0}
                    className="text-[24px] sm:text-[28px]"
                  />
                  <span className="whitespace-nowrap text-text-medium">
                    {totalReviews} değerlendirmeye dayalı
                  </span>
                </div>

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
                  color="primary"
                  className="rounded-lg border-gray-200 px-6 py-2 font-semibold whitespace-nowrap text-text hover:border-gray-400 hover:bg-bg-light"
                >
                  {showForm ? 'Vazgeç' : 'Yorum Yaz'}
                </Button>
              </div>

              {/* Rating Breakdown Bars */}
              <div className="mt-4 flex max-w-[340px] flex-col gap-0.5">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingDistribution[star - 1];
                  const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <Rating value={star} className="text-[14px]" />
                      <ProgressBar
                        value={pct}
                        label={`${star} yıldız oranı`}
                        className="h-2 flex-1 rounded bg-gray-100"
                        indicatorClassName="rounded bg-warning"
                      />
                      <span className="min-w-7 text-right text-xs text-text-medium">
                        {Math.round(pct)}%
                      </span>
                      <span className="min-w-[22px] text-right text-xs text-text-light">
                        ({count})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <hr className="border-gray-200" />
          </>
        )}

        {/* Eligibility error (shown once on click, outside form) */}
        {!showForm && error && (
          <div className="mx-4 mt-4 rounded-lg border border-error bg-error-light px-4 py-2 sm:mx-6">
            <p className="text-xs font-semibold text-error">
              {error}
            </p>
          </div>
        )}

        {/* Review Form (toggle) */}
        {showForm && (
          <>
            <div className="flex flex-col gap-5 px-4 py-6 sm:px-6">
              {!hasReviews && (
                <div className="flex justify-end">
                  <Button variant="text" onClick={() => setShowForm(false)} className="text-text-medium">
                    Vazgeç
                  </Button>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-error bg-error-light px-4 py-2">
                  <p className="text-xs font-semibold text-error">
                    {error}
                  </p>
                </div>
              )}

              {/* Display Name */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    Görünen Ad
                  </span>
                  <span className="text-xs text-text-light">
                    (herkese açık olarak görüntülenir: {customerData?.fullName ?? 'Kullanıcı'})
                  </span>
                </div>
                <Input
                  size="small"
                  placeholder="Görünen adınız"
                  value={customerData?.fullName ?? ''}
                  disabled
                  aria-label="Görünen adınız"
                  className="rounded-lg bg-bg-light"
                />
              </div>

              {/* Rating */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Puan</span>
                <RatingInput value={myRating} onChange={setMyRating} />
              </div>

              {/* Review Title */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Yorum Başlığı</span>
                <Input
                  size="small"
                  placeholder="Yorumunuza bir başlık verin"
                  value={myTitle}
                  onChange={(e) => setMyTitle(e.target.value)}
                  aria-label="Yorum başlığı"
                  className="rounded-lg bg-bg-light"
                />
              </div>

              {/* Review Content */}
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">Yorum İçeriği</span>
                <Input
                  size="small"
                  placeholder="Ürünle ilgili deneyiminizi yazın..."
                  value={myText}
                  onChange={(e) => setMyText(e.target.value)}
                  multiline
                  minRows={4}
                  aria-label="Yorum metni"
                  className="rounded-lg bg-bg-light"
                />
              </div>

              <p className="text-xs text-text-light">
                Verilerinizi nasıl kullandığımız: Bıraktığınız yorum hakkında yalnızca gerektiğinde sizinle
                iletişime geçeceğiz. Yorumunuzu göndererek şartlarımızı, gizlilik ve içerik politikalarımızı
                kabul etmiş olursunuz.
              </p>

              <Button
                variant="contained"
                loading={loading}
                onClick={handleSubmit}
                color="primary"
                className="self-start rounded-lg px-8 py-2.5 text-[15px] font-semibold normal-case"
              >
                Yorumu Gönder
              </Button>
            </div>
            <hr className="border-gray-200" />
          </>
        )}

        {/* Success Message */}
        {success && (
          <div className="mx-4 mt-4 rounded-lg border border-success bg-success-light px-4 py-2 sm:mx-6">
            <p className="text-xs font-semibold text-success">
              {success}
            </p>
          </div>
        )}

        {/* Sort Dropdown */}
        {reviews.length > 0 && (
          <div className="px-4 pt-4 sm:px-6">
            {/* MUI FormControl yalnızca genişlik kabuğuydu; düz div yeter. */}
            <div className="max-w-[180px]">
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
                aria-label="Yorum sıralaması"
                className="h-10 rounded-lg text-[14px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {sortedReviews.length > 0 ? (
          <div className="px-4 pb-6 sm:px-6">
            {sortedReviews.map((review, i) => (
              <article key={review.id ?? `${review.date ?? 'd'}-${i}`}>
                <hr className="my-4 border-gray-200" />
                <div className="flex flex-col gap-2">
                  {/* Rating + Date */}
                  <div className="flex items-center gap-3">
                    {review.rating && (
                      <Rating value={review.rating} className="text-[18px]" />
                    )}
                    <span className="text-xs text-text-light">
                      {formatReviewDate(review.date)}
                    </span>
                  </div>

                  {/* Avatar + Name + Verified */}
                  <div className="flex items-center gap-2">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <span className="text-sm font-bold text-text-medium">
                        {getInitial(review.name)}
                      </span>
                    </span>
                    <div className="flex items-center gap-1">
                      {review.verified === true && (
                        <span className="flex items-center gap-0.5 rounded bg-success-light px-1.5 py-0.5">
                          <CheckCircle2 size={12} className="text-success" />
                          <span className="text-[11px] font-semibold text-success">
                            Doğrulanmış
                          </span>
                        </span>
                      )}
                      <span className="text-sm font-semibold">
                        {review.name ?? 'Kullanıcı'}
                      </span>
                    </div>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <p className="text-sm font-bold">
                      {review.title}
                    </p>
                  )}

                  {/* Review Text */}
                  <p className="leading-[1.6] text-text">
                    {review.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          !showForm && (
            <div className="flex flex-col items-center justify-center gap-3.5 px-4 py-8 text-center sm:px-6 sm:py-10">
              <p className="text-xl leading-[26px] font-medium tracking-[0.01em] text-text-medium sm:text-2xl sm:leading-[30px]">
                Henüz yorum yok, ilk yorumu şimdi yazmak ister misiniz?
              </p>
              <Button
                variant="contained"
                disabled={eligibilityLoading}
                loading={eligibilityLoading}
                onClick={openReviewForm}
                color="primary"
                className="rounded-lg px-5 py-2 text-base font-bold sm:px-7 sm:py-5 sm:text-lg"
                size="small"
              >
                <span className="inline-flex items-center gap-2">
                  <Pencil size={16} />
                  Yorum Yaz
                </span>
              </Button>
            </div>
          )
        )}
      </Card>
    </section>
  );
};

export default ProductReviews;
