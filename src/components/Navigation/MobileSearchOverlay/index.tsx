'use client';

import { ShopContext } from '@/contexts/ShopContext';
import { ArrowLeft, CloseIcon, History, Search } from '@/components/icons';
import searchUrlFromOptions from '@/lib/shop/searchHelpers';
import formatPrice from '@/lib/utils/formatPrice';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { Input } from '@/components/ui/Input';

interface SuggestedProduct {
  id: string;
  name: string;
  brand?: string;
  url: string;
  imgSrc?: string;
  price?: { currentPrice: number; originalPrice: number; currency: string };
}

interface MobileSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;
const SUGGESTION_LIMIT = 6;

const MobileSearchOverlay = ({ open, onClose }: MobileSearchOverlayProps) => {
  const router = useRouter();
  const { searchHistory, addSearchQuery, removeSearchQuery, clearAllHistory } =
    useContext(ShopContext);

  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<SuggestedProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= MIN_QUERY_LENGTH;

  // Acilista alan temizlenir, klavye gelsin diye odak verilir.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setProducts([]);
    setTotalCount(0);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(focusTimer);
  }, [open]);

  // Overlay acikken arkadaki sayfa kaymasin.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Yazarken canli oneri: her tusta degil, duraklamada istek atiliyor.
  useEffect(() => {
    if (!open || !hasQuery) {
      setProducts([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/shop/search?query=${encodeURIComponent(trimmed)}&limit=${SUGGESTION_LIMIT}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error('search failed');
        const data = await response.json();
        setProducts(data.products ?? []);
        setTotalCount(data.totalCount ?? 0);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setProducts([]);
          setTotalCount(0);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, hasQuery, trimmed]);

  const goToResults = (value: string) => {
    const term = value.trim();
    if (!term) return;
    addSearchQuery(term);
    onClose();
    router.push(searchUrlFromOptions({ query: term }, true));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    goToResults(query);
  };

  const openProduct = (url: string) => {
    if (trimmed) addSearchQuery(trimmed);
    onClose();
    router.push(url);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1400] hidden flex-col bg-bg max-sm:flex"
      role="dialog"
      aria-modal="true"
      aria-label="Arama"
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1 border-b border-gray-100 px-2 py-2.5"
        autoComplete="off"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="inline-flex size-10 shrink-0 appearance-none items-center justify-center rounded-full border-0 bg-transparent p-0"
        >
          <ArrowLeft size={22} strokeWidth={1.5} />
        </button>
        <Input
          ref={inputRef}
          size="small"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ürün, marka veya ihtiyaç ara"
          aria-label="Ürün ara"
          /* Eski styles.input: köşe 999, zemin gray[50], 15px, pl 1.5 */
          className="rounded-full border-transparent bg-gray-50 pl-3"
          inputClassName="text-[16px] sm:text-[15px]"
          startSlot={<Search size={18} strokeWidth={1.5} className="mr-2 shrink-0" />}
          endSlot={
            query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Temizle"
                className="inline-flex size-7 appearance-none items-center justify-center rounded-full border-0 bg-transparent p-0"
              >
                <CloseIcon size={16} />
              </button>
            ) : null
          }
        />
      </form>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 [-webkit-overflow-scrolling:touch]">
        {!hasQuery && searchHistory.length > 0 && (
          <section className="flex flex-col gap-1">
            <div className="flex items-center justify-between py-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-text-medium-light">
                Son aramalar
              </h2>
              <button
                type="button"
                className="appearance-none border-0 bg-transparent p-0 text-[13px] text-text-medium-light"
                onClick={clearAllHistory}
              >
                Temizle
              </button>
            </div>
            {searchHistory
              .slice(-8)
              .reverse()
              .map((item) => (
                <div key={item} className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="flex flex-1 appearance-none items-center gap-2.5 border-0 bg-transparent py-2 text-left text-text-medium-light"
                    onClick={() => goToResults(item)}
                  >
                    <History size={16} strokeWidth={1.5} />
                    <span className="text-[15px] text-text">{item}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSearchQuery(item)}
                    aria-label="Kaldır"
                    className="inline-flex size-8 appearance-none items-center justify-center rounded-full border-0 bg-transparent p-0"
                  >
                    <CloseIcon size={15} />
                  </button>
                </div>
              ))}
          </section>
        )}

        {!hasQuery && searchHistory.length === 0 && (
          <p className="py-8 text-sm leading-[1.6] text-text-medium-light">
            Ürün, marka ya da cilt ihtiyacını yazmaya başla — sonuçlar anında listelenir.
          </p>
        )}

        {hasQuery && loading && products.length === 0 && (
          <div className="flex items-center justify-center py-10 text-text-medium-light">
            <Spinner size={22} />
          </div>
        )}

        {hasQuery && !loading && products.length === 0 && (
          <p className="py-8 text-sm leading-[1.6] text-text-medium-light">
            “{trimmed}” için sonuç bulunamadı. Farklı bir kelime deneyebilirsin.
          </p>
        )}

        {hasQuery && products.length > 0 && (
          <section className="flex flex-col gap-1">
            {products.map((product) => (
              <button
                type="button"
                key={product.id}
                className="flex w-full appearance-none items-center gap-3 border-x-0 border-t-0 border-b border-gray-100 bg-transparent px-0 py-2.5 text-left last:border-b-0"
                onClick={() => openProduct(product.url)}
              >
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                  {product.imgSrc && (
                    <Image
                      src={product.imgSrc}
                      alt={product.name}
                      fill
                      sizes="64px"
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  {product.brand && (
                    <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-medium-light">
                      {product.brand}
                    </span>
                  )}
                  <span className="line-clamp-2 text-sm leading-[1.35] text-text">
                    {product.name}
                  </span>
                  {product.price && (
                    <span className="text-sm font-semibold text-text">
                      {formatPrice(product.price.currentPrice, product.price.currency)}
                    </span>
                  )}
                </span>
              </button>
            ))}

            <button
              type="button"
              className="mb-8 mt-4 flex w-full appearance-none items-center justify-center gap-2 rounded-full border border-gray-200 bg-transparent py-3 text-text"
              onClick={() => goToResults(trimmed)}
            >
              <span className="text-sm font-semibold">
                Tüm sonuçları gör{totalCount ? ` (${totalCount})` : ''}
              </span>
              <Search size={16} strokeWidth={1.8} />
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default MobileSearchOverlay;
